import time
import threading

def memory_leak():
    # Keep consuming memory
    leak = []
    while True:
        leak.append(' ' * 10**6)  # Allocate 1MB
        time.sleep(0.1)

def cpu_stress():
    # Consume CPU cycles
    while True:
        pass

# Start memory leak and CPU stress in separate threads
threading.Thread(target=memory_leak).start()
threading.Thread(target=cpu_stress).start()
