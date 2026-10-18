import re
import sys

def resolve(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # The regex matches <<<<<<< HEAD\n...\n=======\n...\n>>>>>>> feature/...\n
    # non-greedy match .*? to only get one conflict block
    pattern = re.compile(r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> [^\n]*\n', re.DOTALL)
    
    def repl(m):
        return m.group(1) + m.group(2)

    new_content = pattern.sub(repl, content)

    with open(filepath, 'w') as f:
        f.write(new_content)

resolve(sys.argv[1])
