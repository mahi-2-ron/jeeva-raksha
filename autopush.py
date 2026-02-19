import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class AutoPushHandler(FileSystemEventHandler):

    def on_modified(self, event):
        if ".git" in event.src_path:
            return
        
        print("Change detected → pushing to GitHub...")

        os.system("git add .")
        os.system('git commit -m "auto update"')
        os.system("git push")

path = "."
event_handler = AutoPushHandler()
observer = Observer()
observer.schedule(event_handler, path, recursive=True)
observer.start()

print("Watching files... Press CTRL+C to stop")

try:
    while True:
        time.sleep(2)
except KeyboardInterrupt:
    observer.stop()

observer.join()
