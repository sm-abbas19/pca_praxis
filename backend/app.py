from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import uuid

# Add parent directory to path to import modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
import llm_engine
import sandbox
import security

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# In-memory session storage (in production, use Redis or database)
sessions = {}

def get_session(session_id):
    """Get or create a session"""
    if session_id not in sessions:
        sessions[session_id] = {
            "plan": None,
            "is_risky": False,
            "last_result": None,
            "chat_history": [],
            "working_folder": os.getcwd()
        }
    return sessions[session_id]

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "llm_engine": "active",
        "docker_sandbox": "active",
        "security": "active"
    })

@app.route('/api/session/init', methods=['POST'])
def init_session():
    """Initialize a new session"""
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "plan": None,
        "is_risky": False,
        "last_result": None,
        "chat_history": [],
        "working_folder": os.getcwd()
    }
    return jsonify({"session_id": session_id})

@app.route('/api/session/<session_id>/folder', methods=['GET', 'POST'])
def manage_folder(session_id):
    """Get or set working folder"""
    session = get_session(session_id)
    
    if request.method == 'GET':
        return jsonify({"working_folder": session["working_folder"]})
    
    elif request.method == 'POST':
        data = request.json
        folder_path = data.get('folder_path')
        if folder_path and os.path.exists(folder_path):
            session["working_folder"] = folder_path
            return jsonify({"success": True, "working_folder": folder_path})
        return jsonify({"success": False, "error": "Invalid folder path"}), 400

@app.route('/api/session/<session_id>/clear', methods=['POST'])
def clear_session(session_id):
    """Clear agent memory"""
    session = get_session(session_id)
    session["chat_history"] = []
    session["last_result"] = None
    session["plan"] = None
    return jsonify({"success": True})

@app.route('/api/plan/generate', methods=['POST'])
def generate_plan():
    """Generate a plan from user input"""
    data = request.json
    session_id = data.get('session_id')
    user_input = data.get('user_input')
    
    if not session_id or not user_input:
        return jsonify({"error": "Missing session_id or user_input"}), 400
    
    session = get_session(session_id)
    
    # Sanitize input
    clean_input = security.sanitize_input(user_input)
    
    # Get context from chat history
    history_text = "\n".join(session["chat_history"][-5:])
    
    # Generate command using LLM
    raw_cmd = llm_engine.get_bash_command(clean_input, context=history_text)
    clean_cmd = raw_cmd.split('\n')[0].strip()
    
    # Validate command
    is_safe, msg = security.validate_command(clean_cmd)
    
    # Update session
    session["plan"] = clean_cmd
    session["is_risky"] = not is_safe
    session["last_result"] = None
    
    return jsonify({
        "plan": clean_cmd,
        "is_safe": is_safe,
        "message": msg if is_safe else f"⚠️ POLICY VIOLATION: {msg}"
    })

@app.route('/api/plan/cancel', methods=['POST'])
def cancel_plan():
    """Cancel the current plan"""
    data = request.json
    session_id = data.get('session_id')
    
    if not session_id:
        return jsonify({"error": "Missing session_id"}), 400
    
    session = get_session(session_id)
    session["plan"] = None
    
    return jsonify({"success": True})

@app.route('/api/command/execute', methods=['POST'])
def execute_command():
    """Execute the command in sandbox"""
    data = request.json
    session_id = data.get('session_id')
    user_input = data.get('user_input')
    
    if not session_id:
        return jsonify({"error": "Missing session_id"}), 400
    
    session = get_session(session_id)
    
    if not session["plan"]:
        return jsonify({"error": "No plan to execute"}), 400
    
    # Execute in sandbox
    result = sandbox.execute_in_sandbox(
        session["plan"],
        host_folder=session["working_folder"]
    )
    
    # Update chat history
    if user_input:
        session["chat_history"].append(f"User: {user_input}")
    session["chat_history"].append(f"AI Executed: {session['plan']}")
    
    # Update session
    session["last_result"] = result
    session["plan"] = None
    
    return jsonify({
        "success": True,
        "result": result,
        "is_empty": result.strip() == ""
    })

@app.route('/api/session/<session_id>/state', methods=['GET'])
def get_state(session_id):
    """Get current session state"""
    session = get_session(session_id)
    return jsonify({
        "plan": session["plan"],
        "is_risky": session["is_risky"],
        "last_result": session["last_result"],
        "chat_history": session["chat_history"],
        "working_folder": session["working_folder"]
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)

