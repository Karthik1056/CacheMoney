Set-Location $PSScriptRoot

# Overview
playwright-cli -s=my open http://localhost:3000/overview
playwright-cli -s=my screenshot --filename=output/overview-test.png
playwright-cli -s=my snapshot --filename=overview-snapshot.yml
playwright-cli -s=my close

# Expenses
playwright-cli -s=my open http://localhost:3000/expenses
playwright-cli -s=my snapshot --filename=expenses-before.yml
playwright-cli -s=my screenshot --filename=output/expenses-before.png
playwright-cli -s=my click "button:has(svg.lucide-chevron-left)"
playwright-cli -s=my screenshot --filename=output/expenses-after.png
playwright-cli -s=my snapshot --filename=expenses-after.yml
playwright-cli -s=my close

# Entries
playwright-cli -s=my open http://localhost:3000/entries
playwright-cli -s=my snapshot --filename=entries-before.yml
playwright-cli -s=my fill "input[type='text']" "Groceries"
playwright-cli -s=my snapshot --filename=entries-after-search.yml
playwright-cli -s=my click "button:has-text('Filter')"
playwright-cli -s=my snapshot --filename=entries-filter-menu.yml
playwright-cli -s=my screenshot --filename=output/entries-filtered.png
playwright-cli -s=my close

# Savings
playwright-cli -s=my open http://localhost:3000/savings
playwright-cli -s=my snapshot --filename=savings-snapshot.yml
playwright-cli -s=my screenshot --filename=output/savings-test.png
playwright-cli -s=my close

# Reminders
playwright-cli -s=my open http://localhost:3000/reminders
playwright-cli -s=my snapshot --filename=reminders-before.yml
playwright-cli -s=my click "button:has(svg)"
playwright-cli -s=my screenshot --filename=output/reminders-test.png
playwright-cli -s=my snapshot --filename=reminders-after.yml
playwright-cli -s=my close

# Notifications
playwright-cli -s=my open http://localhost:3000/notifications
playwright-cli -s=my snapshot --filename=notifications-before.yml
playwright-cli -s=my screenshot --filename=output/notifications-before.png
playwright-cli -s=my click "button:has(svg)"
playwright-cli -s=my click "text='Mark Read'"
playwright-cli -s=my click "button:has(svg)"
playwright-cli -s=my click "text='Delete'"
playwright-cli -s=my screenshot --filename=output/notifications-after.png
playwright-cli -s=my snapshot --filename=notifications-after.yml
playwright-cli -s=my close
