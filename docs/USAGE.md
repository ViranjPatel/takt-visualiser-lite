# Takt Visualiser Lite - Usage Guide

## Getting Started

1. **Open the Application**
   - Simply open `index.html` in any modern web browser
   - No installation or server setup required

2. **Default Data**
   - The app comes with sample zones and trades
   - You can modify or delete these as needed

## Creating Tasks

1. Click the **"+ New Task"** button in the header
2. Fill in the task details:
   - **Task Name**: Descriptive name for the activity
   - **Zone**: Select where the work will happen
   - **Trade**: Choose the trade/team responsible
   - **Start Date**: When the task begins
   - **Duration**: How many days it will take
   - **Status**: Current state (Planned/In Progress/Completed)
3. Click **Save**

## Managing Tasks

### Moving Tasks
- **Drag horizontally** to change dates
- **Drag vertically** to change zones
- Changes are saved automatically

### Resizing Tasks
- **Drag the edges** to adjust duration
- Minimum duration is 1 day

### Editing Tasks
- **Click on any task** to open the edit dialog
- Make changes and save

## Zones (Work Areas)

- Zones represent physical locations or work areas
- They form a hierarchy (Building > Floor > Zone)
- Click on a zone in the sidebar to filter view
- Currently zones must be managed via import/export

## Trades (Teams)

- Trades represent different teams or disciplines
- Each trade has a unique color for easy identification
- Default trades include:
  - Framing (Blue)
  - Electrical (Green)
  - Plumbing (Orange)
  - Drywall (Red)
  - Painting (Purple)

## View Controls

### Time Scale
- **View**: Switch between Days, Weeks, or Months
- **Days**: Set how many days to display (7-365)
- **Zoom**: Adjust cell width for better visibility

## Data Management

### Export
1. Click **Export** button
2. Your project downloads as a JSON file
3. File includes all tasks, zones, and trades
4. Filename includes the current date

### Import
1. Click **Import** button
2. Select a previously exported JSON file
3. **Warning**: This replaces all current data

### Clear All
1. Click **Clear All** button
2. Confirm the action
3. All data is permanently deleted
4. Default zones and trades are restored

## Tips

- **Use colors** to quickly identify trade types
- **Group related tasks** in the same zone
- **Export regularly** to backup your work
- **Zoom out** to see the big picture
- **Zoom in** for detailed scheduling

## Keyboard Shortcuts

- `Esc` - Close modal dialogs
- `Delete` - Delete selected task (when editing)

## Data Storage

- All data is stored locally in your browser
- No internet connection required after initial load
- Data persists between browser sessions
- Clear browser data will delete your projects

## Limitations

- Single user only (no collaboration)
- No automatic cloud backup
- Limited to browser storage capacity
- No dependencies between tasks
- No resource leveling

## Troubleshooting

**Tasks not saving?**
- Check browser console for errors
- Try a different browser
- Export and reimport your data

**Performance issues?**
- Reduce the number of visible days
- Use a modern browser (Chrome/Firefox/Safari)
- Close other browser tabs

**Lost data?**
- Check your Downloads folder for exports
- Use browser's restore session feature
- Unfortunately, cleared data cannot be recovered
