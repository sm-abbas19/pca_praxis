import streamlit as st
import llm_engine
import sandbox
import security
import tkinter as tk
from tkinter import filedialog
import os

# --- HELPER: GUI FOLDER PICKER ---
def get_folder_from_gui():
    try:
        root = tk.Tk()
        root.withdraw()
        root.wm_attributes('-topmost', 1)
        folder_path = filedialog.askdirectory(master=root)
        root.destroy()
        return folder_path
    except Exception:
        return None

st.set_page_config(page_title="PCA-Praxis Agent", layout="wide")

# --- FIX: HANDLE TEXT INPUT RESET ---
if "trigger_reset" not in st.session_state:
    st.session_state.trigger_reset = False

if st.session_state.trigger_reset:
    st.session_state.user_prompt = ""
    st.session_state.trigger_reset = False

st.title("🤖 PCA-Praxis: Secure CLI Agent")

# --- SIDEBAR ---
with st.sidebar:
    st.header("System Status")
    st.success("🟢 LLM Engine (Phi-3)")
    st.success("🟢 Docker Sandbox")
    st.info("🛡️ Security: Active")

    st.markdown("---")
    st.header("⚙️ Settings")

    if "working_folder" not in st.session_state:
        st.session_state.working_folder = os.getcwd()

    if st.button("📂 Change Target Folder"):
        selected = get_folder_from_gui()
        if selected:
            st.session_state.working_folder = selected

    st.caption("Target Directory:")
    st.code(st.session_state.working_folder)

    if st.button("🗑️ Clear Agent Memory"):
        st.session_state.chat_history = []
        st.session_state.last_result = None
        st.session_state.plan = None
        st.rerun()

# --- SESSION STATE ---
if "plan" not in st.session_state:
    st.session_state.plan = None
if "is_risky" not in st.session_state:
    st.session_state.is_risky = False
if "last_result" not in st.session_state:
    st.session_state.last_result = None
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

# --- STEP 1: USER INPUT ---
st.subheader("1. Task Definition")

user_input = st.text_input(
    "Describe your task:",
    placeholder="e.g., Create three text files",
    key="user_prompt"
)

if st.button("Generate Plan"):
    if user_input:
        with st.spinner("Analyzing Context & Generating..."):
            st.session_state.last_result = None
            clean_input = security.sanitize_input(user_input)
            history_text = "\n".join(st.session_state.chat_history[-5:])
            raw_cmd = llm_engine.get_bash_command(clean_input, context=history_text)
            clean_cmd = raw_cmd.split('\n')[0].strip()
            is_safe, msg = security.validate_command(clean_cmd)
            st.session_state.plan = clean_cmd

            if is_safe:
                st.success("Plan Verified Safe")
                st.session_state.is_risky = False
            else:
                st.warning(f"⚠️ POLICY VIOLATION: {msg}")
                st.session_state.is_risky = True

# --- STEP 2: VERIFICATION & EXECUTION ---
if st.session_state.plan:
    # THE FIX: Create a placeholder container
    verification_container = st.empty()

    # Render the UI inside this container
    with verification_container.container():
        st.subheader("2. Verification")
        st.code(st.session_state.plan, language="bash")

        if st.session_state.is_risky:
            st.error("🚨 WARNING: This command is blocked by default policy.")
            btn_label = "💀 Force Execute (Risky)"
            btn_type = "secondary"
        else:
            btn_label = "✅ Execute Now"
            btn_type = "primary"

        col1, col2 = st.columns([1, 5])

        # We need to capture the button clicks first
        with col1:
            run_clicked = st.button(btn_label, type=btn_type)
        with col2:
            cancel_clicked = st.button("❌ Cancel")

    # LOGIC AFTER CLICKING (Outside the rendering block)
    if run_clicked:
        # 1. DELETE the Verification UI immediately so it doesn't duplicate
        verification_container.empty()

        # 2. Run the Spinner
        with st.spinner(f"Running in Sandbox..."):
            result = sandbox.execute_in_sandbox(
                st.session_state.plan,
                host_folder=st.session_state.working_folder
            )

        # 3. Save State & Refresh
        st.session_state.chat_history.append(f"User: {user_input}")
        st.session_state.chat_history.append(f"AI Executed: {st.session_state.plan}")
        st.session_state.last_result = result
        st.session_state.plan = None
        st.session_state.trigger_reset = True
        st.rerun()

    if cancel_clicked:
        st.session_state.plan = None
        st.rerun()

# --- STEP 3: RESULT ---
if st.session_state.last_result is not None:
    st.markdown("---")
    st.subheader("3. Execution Result")

    if st.session_state.last_result.strip() == "":
        st.success("✅ Command executed successfully! (No output returned)")
    else:
        st.code(st.session_state.last_result)
