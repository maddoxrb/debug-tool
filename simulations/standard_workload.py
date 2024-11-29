import time

def compute():
    # Perform some computations
    total = 0
    for i in range(1000000):
        total += i
    time.sleep(1)  # Sleep to moderate CPU usage

while True:
    compute()
