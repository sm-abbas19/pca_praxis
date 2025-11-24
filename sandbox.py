# sandbox.py
import docker
import os

def execute_in_sandbox(command, host_folder=None):
    """
    Executes command in isolated Docker container using Ubuntu (Full Bash Support).
    """
    try:
        client = docker.from_env()

        # Use the GUI selected folder, or default to current
        target_folder = host_folder if host_folder else os.getcwd()

        # Sanity check
        if not os.path.exists(target_folder):
            return f"System Error: The folder '{target_folder}' does not exist."

        # Spin up ephemeral container (Ubuntu)
        # We use 'ubuntu:latest' instead of 'alpine'
        container = client.containers.run(
            image="ubuntu:latest",  # <--- CHANGED FROM ALPINE
            command=f"/bin/bash -c '{command}'", # <--- EXPLICITLY CALL BASH
            working_dir="/workspace",
            volumes={
                target_folder: {'bind': '/workspace', 'mode': 'rw'}
            },
            detach=True
        )

        container.wait()

        # Capture output
        output = container.logs().decode("utf-8")

        # Immediate Cleanup
        container.remove()

        return output

    except docker.errors.ContainerError as e:
        return f"Execution Error: {e.stderr.decode('utf-8')}"
    except Exception as e:
        return f"System Error: {str(e)}"
