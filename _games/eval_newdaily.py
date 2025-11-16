from pathlib import Path
from playwright.sync_api import sync_playwright
import json

path = Path('sudoku.html').resolve().as_uri()
results = {}
console_messages = []

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1280, 'height': 900})
    page.on('console', lambda msg: console_messages.append({'type': msg.type, 'text': msg.text}))
    page.goto(path)
    page.wait_for_timeout(3000)
    for name in ['New puzzle', 'Daily puzzle', 'Restart', 'Check']:
        try:
            page.get_by_role('button', name=name).click()
            page.wait_for_timeout(200)
        except Exception as exc:
            results[f'{name}_error'] = str(exc)
    keypads = page.locator('.mobile-keypad button')
    keypad_labels = keypads.all_text_contents()
    results['keypad_buttons'] = keypad_labels
    results['status_text'] = page.inner_text('#status-text')
    results['grid_cells'] = page.eval_on_selector_all('.cell', 'nodes => nodes.length')
    try:
        note_button = page.get_by_role('button', name='Notes (N)')
        note_button.click()
        page.wait_for_timeout(200)
        results['notes_pressed_state'] = note_button.get_attribute('aria-pressed')
    except Exception as exc:
        results['notes_error'] = str(exc)
    browser.close()

results['console_messages'] = console_messages
print(json.dumps(results, indent=2))
