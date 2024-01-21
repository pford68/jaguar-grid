import React, {useState} from "react";
import DataGrid from "./js/DataGrid";
import voterData from "../tests/fixtures/nonvoters_data.json";
import ObservableList, {Record} from "./js/ObservableList";
import TableColumn from "./js/TableColumn";
import Container from "./js/layout/Container";
import {Struct} from "./types/types";
import styles from "./App.css";
import {library} from "@fortawesome/fontawesome-svg-core";
import {fas} from "@fortawesome/free-solid-svg-icons";
import {far} from "@fortawesome/free-regular-svg-icons";

library.add(fas);
library.add(far);


const App = () => {
    const data = (voterData as Struct[]);
    const records = new ObservableList((data as Struct[]).map(item => new Record(item)));
    const [columnCount, setColumnCount] = useState(20);
    return (
        <section className={styles.main}>
            <h1>Jaguar Grid Demo</h1>
            <div className={styles.header}>
                <label>Columns:
                    <select onChange={(e) => setColumnCount(Number((e.target as HTMLSelectElement).value))}>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                        <option value={90}>90</option>
                        <option value={119}>all</option>
                    </select>
                </label>
            </div>
            <Container height={600} width={800} border>
                <DataGrid
                    data={records}
                    stickyHeaders
                    alternateRows
                    columnSizing="auto"
                    pageSize={8}
                >
                    {Object.keys((data[0] as Struct)).slice(0, columnCount + 1).map((key, index) => (
                        <TableColumn key={index} name={key} text={key} width={150}/>
                    ))}
                </DataGrid>
            </Container>
            <div className={styles.footer}>
                <div>Row count: {records.length}</div>
                <div>Column count: {columnCount}</div>
                <cite>
                    <span>Voter data from</span>
                    <a href="https://github.com/fivethirtyeight/data/tree/master/airline-safety">538</a>
                </cite>
            </div>
        </section>
    )
}

export default App;