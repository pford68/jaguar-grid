# jaguar-grid
Just Another (Data)Grid Useful for Applications with React

Off ond on, I have spent much of the last 2 years working on datagrids. Now, I want to design one of my own, applying lessons learned from previous projects.

Those familiar with JavaFX will see a lot of similarity in the interfaces.  I drew some inspiration from TableView.

## Features
The following features are currently supported:

* Editable cells
* Keyboard cell navigation
* Sticky headers and sticky columns
* Resizable columns
* Auto-sizing columns to fit the content (with caveats), when no initial width is specified
* Sortable columns
* Virtualized rows to handle large datasets
* Support for copying/cutting and pasting cell values
    * Either copying the value from the model, as opposed to the displayed text
    * Or copying the displayed text if the text is selected:  either by double-/triple-clicked or by drag-selecting.
    * The paste operation should update the model for the update the updated cells.
* Support for batch-copying and pasting
    * The ability to select entire rows/columns
* Support for undoing and redoing operations like cut and paste.
* Support for context menus


### TODOs
* Showing/hiding columns
* Support for secondary sort
* Dragging columns



## Lessons Learned
### Implement the grid with DIVs instead of tables
Previously I chose a `<table>` implementation because we would get so much desired behavior for free. However, I came to regret that decision once I started implementing resizable columns and virtualization.  The problems that emerged were solvable, but they were surprises and would not have happened with a `<div>` implementation.

#### Resizable columns
HTML tables adjust to changes to column widths, especially if you assign a width to the table, which you might do if you want to use `table-layout: fixed` for performance.  Thus, if you shrink one column, for example, another column may enlarge to compensate.

This is a solvable problem.  In short, set **min-widths** on columns, instead of widths, when resizing columns, and set a **max-width** on the table when narrowing columns, to ensure that the column narrows in all browsers. (Looking at you, Safari.)

##### The problem with this approach
* What if I want to use a fixed table layout?  Avoiding setting a table width precludes that.
* I also think it is unexpected, and maybe fragile, that you have to avoid setting the width property.


#### Virtualization
In theory, using IntersectionObserver makes virtualization simple:
* Divide the dataset into buckets of _n_ rows.
* Create a `<tbody>` for each bucket.
* Using the estimated height of a row, calculate the height of each empty bucket.
    * This allows the scrollbars for the table's container to reflect the size of the dataset.
* As a `<tbody>` element crosses the intersection boundary (for the IntersectionObserver), re-render the bucket to display the rows.
* As a `<tbody>` element passes the intersection boundary to leave the view, re-render the bucket to remove the rows.

##### The problem with this approach
In some browsers, IntersectionObserver doesn't play nice with `<tbody>` elements. The approach above works great in Chrome, but not in Firefox or Safari. In those browsers, all buckets fill immediately. Thus, a dataset of 3000 rows and 30 columns would crash the browser.
* The problem is that, even if the CSS height property of the empty `<tbody>` elements is set, the IntersectionObserver regards those elements as having 0 height; thus, it determines that all of the `<tobdy>` elements are intersecting.
* This problem can be solved (sub-optimally) by adding an empty `<tr>` element, with the correct height, to the each empty `<tbody>`. 


#### Further issues
A similar approach is discussed [here](https://gusruss89.medium.com/super-simple-list-virtualization-in-react-with-intersectionobserver-ca340fe98a34).
This approach creates a lot of extra elements, but it has been used in production with no known performance issues.



## Usage
In short:
1. Take an array of objects, perhaps returned from an API, convert it to an array of Records,
2. Pass that array to an ObservableList. That list notified listeners when changes are made to the list.
3. Pass that ObservableList to the DataGrid component's `data` prop.
4. Added a `<TableColumn>` component for each column that you want to display.

```tsx
function MyGreatPage(props) {
  const data = new ObservableList(serverData.map(item => new Record(item)));

  return (
          <>
            ...
            <DataGrid
              data={data}
              editable
              alternateRows
              stickyHeaders
              secondarySort
            >
                <TableColumn name="firstName" text="First Name" validator={v => v != "Bob"} />
                <TableColumn name="lastName" text="Last Name" required />
                <TableColumn type="currency" name="amount" text="Amount" />
                <TableColumn type="number" name="age" text="Age" />
                <TableColumn name="active" text="Active" />
                <TableColumn name="lastUpdated" text="Last Updated" />
                <TableColumn
                    name="measurements"
                    text="Height"
                    renderer={props => {
                        const measurements = props.row.get(props.name);
                        const {height} = (measurements as Measurements) ?? {};
                        return (
                            <NumericRenderer
                                active={props.active}
                                rendererRef={props.rendererRef}
                                name={props.name}
                                value={height}
                                className={props.className}
                            />
                        )
                    }}
                />
            </DataGrid>
          </>
  )
}
```

## Documentation
For more information about editing, moving in/out of edit mode, and available key commands, see the Wiki.
TBD.