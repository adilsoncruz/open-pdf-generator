import xml.etree.ElementTree as ET
import sys
tree = ET.parse('build/reports/jacoco/test/jacocoTestReport.xml')
root = tree.getroot()
classes = []
for pkg in root.findall('package'):
    for cls in pkg.findall('class'):
        missed = sum(int(c.get('missed')) for c in cls.findall('counter') if c.get('type') == 'LINE')
        covered = sum(int(c.get('covered')) for c in cls.findall('counter') if c.get('type') == 'LINE')
        if missed+covered > 0: classes.append({'n': cls.get('name'), 'm': missed, 'c': covered, 't': missed+covered})
tm = sum(c['m'] for c in classes)
tt = sum(c['t'] for c in classes)
print(f"TOTAL: {(tt-tm)/tt*100:.2f}% ({tt-tm}/{tt})")
