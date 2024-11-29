import subprocess
import csv
import time
import datetime
import json

# Containers to monitor
containers = {
    'standard_container': 'working',
    'failure_container': 'error'
}

# Open CSV file for writing
with open('docker_stats.csv', mode='w', newline='') as csv_file:
    fieldnames = ['timestamp', 'container_id', 'name', 'cpu_perc', 'mem_usage', 'mem_limit',
                  'mem_perc', 'net_io', 'block_io', 'pids', 'label']
    writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
    writer.writeheader()

    try:
        while True:
            # Get stats in JSON format
            result = subprocess.run(
                ['docker', 'stats', '--no-stream', '--format',
                 '{"container_id":"{{.ID}}","name":"{{.Name}}","cpu_perc":"{{.CPUPerc}}",'
                 '"mem_usage":"{{.MemUsage}}","mem_perc":"{{.MemPerc}}","net_io":"{{.NetIO}}",'
                 '"block_io":"{{.BlockIO}}","pids":"{{.PIDs}}"}'],
                stdout=subprocess.PIPE)
            output = result.stdout.decode('utf-8').strip().split('\n')

            timestamp = datetime.datetime.now().isoformat()

            for line in output:
                stats = json.loads(line)
                container_name = stats['name']
                if container_name in containers:
                    label = containers[container_name]
                    mem_usage, mem_limit = stats['mem_usage'].split(' / ')
                    row = {
                        'timestamp': timestamp,
                        'container_id': stats['container_id'],
                        'name': stats['name'],
                        'cpu_perc': stats['cpu_perc'].strip('%'),
                        'mem_usage': mem_usage.strip('MiB'),
                        'mem_limit': mem_limit.strip('MiB'),
                        'mem_perc': stats['mem_perc'].strip('%'),
                        'net_io': stats['net_io'],
                        'block_io': stats['block_io'],
                        'pids': stats['pids'],
                        'label': label
                    }
                    writer.writerow(row)
            time.sleep(1)
    except KeyboardInterrupt:
        print("Data collection stopped.")
