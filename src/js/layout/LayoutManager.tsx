import {ReactElement} from "react";
import TableColumn from "../TableColumn";
import {DataGridProps} from "../DataGrid";
import TableFooter from "../TableFooter";

/**
 * DataGrid's delegates much of the work of measuring various elements is delegated to this class.
 */
export class LayoutManager {
    readonly #props: DataGridProps;
    readonly #columns: ReactElement[];
    readonly #children: ReactElement[];
    #containerHeight: number | undefined;
    #containerWidth: number | undefined;
    #visibleColumns: ReactElement[] | undefined;

    constructor(props: DataGridProps) {
        this.#props = props;
        const {children} = props;
        this.#children = Array.isArray(children) ? children : [children];
        this.#columns = this.#children
            .filter(child => child.type === TableColumn);
    }

    get children(): ReactElement[] {
        return this.#children;
    }

    get columns(): ReactElement[] {
        return this.#columns;
    }

    get visibleColumns(): ReactElement[] {
        if (this.#visibleColumns == null) {
            this.#visibleColumns = this.columns.filter(col => col.props.visible);
        }
        return this.#visibleColumns;
    }

    get containerSize(): Size {
        return {
            height: this.#containerHeight,
            width: this.#containerWidth
        };
    }

    setContainerSize(el: HTMLElement): void {
        const {height, width} = (el.parentElement ?? document.body).getBoundingClientRect();
        this.#containerHeight = height;
        this.#containerWidth = width;
    }

    getFooter(): ReactElement | undefined {
        return this.#children.find(child => child.type === TableFooter);
    }

    get maxColumnWidth(): number {
        return (this.#containerWidth ?? 0) / this.visibleColumns.length;
    }

    fitContainer(el: HTMLElement): boolean {
        const {width} = el.getBoundingClientRect();
        this.setContainerSize(el);
        const {width: containerWidth} = this.containerSize;
        return width < (containerWidth ?? 0);
    }

}

type Size = {
    height: number | undefined,
    width: number | undefined,
}