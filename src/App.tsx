import React from "react";
import styles from "./App.css";
import NumericRenderer from "./js/renderers/NumericRenderer";

const App = () =>{
    return (<NumericRenderer active={true} value={29} name={"age"} />)
}

export default App;