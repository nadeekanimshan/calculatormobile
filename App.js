//  IM_2021_087

import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View, Keyboard } from "react-native";
import { Ionicons, FontAwesome5, FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Button from "./components/Button";
import Row from "./components/Row";
import { valueHasOp, calculateResult } from './util/Cal_logic';
import History from "./util/History";

export default function App() {
  const [calValue, setCalValue] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [previewValue, setPreviewValue] = useState("");
  const [isAnswer, setIsAnswer] = useState(false);
  const [cursorSel, setCursorSel] = useState({ end: 0, start: 0 });
  const [isCursorSel, setIsCursorSel] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const ansColor = {
    color: isAnswer ? "orange" : "white",
  };

  useEffect(() => {
    Keyboard.dismiss();

    if (valueHasOp(calValue)) {
      let prevAns = calculateResult(calValue);
      setPreviewValue(`${prevAns}`);
    } else {
      setPreviewValue(``);
    }
  }, [calValue]);

  const handleBackSpace = () => {
    const remainValue = calValue.slice(0, calValue.length - 1);
    setCalValue(remainValue);
    setDisplayValue(remainValue.replace(/\*/g, '×').replace(/\//g, '÷'));
  };

 const handlePress = (text) => {
    if (isAnswer) {
        setCalValue("");
        setDisplayValue("");
        setIsAnswer(false);
    }

    let corrText = text === "X" ? "*" : text;

    // Prevent multiple consecutive operators
    const lastChar = calValue.slice(-1);
    const operators = ["+", "-", "*", "/", "×", "÷"];
    if (operators.includes(lastChar) && operators.includes(corrText)) {
        return; // Do nothing if the last character and current text are both operators
    }

    if (text === "√") {
        if (calValue) {
            const lastNumberMatch = calValue.match(/[-]?\d+(\.\d+)?$/);
            if (lastNumberMatch) {
                const lastNumber = lastNumberMatch[0];
                if (parseFloat(lastNumber) >= 0) {
                    const sqrtValue = Math.sqrt(parseFloat(lastNumber)).toString();
                    const updatedValue = calValue.slice(0, -lastNumber.length) + sqrtValue;
                    setCalValue(updatedValue);
                    setDisplayValue(updatedValue.replace(/\*/g, '×').replace(/\//g, '÷'));
                } else {
                    setCalValue("Invalid Input");
                    setDisplayValue("Invalid Input");
                }
            }
        }
        return;
    }

    if (text === "%") {
        if (calValue) {
            const lastNumber = calValue.split(/[\+\-\*\/]/).pop();
            const percentageValue = (parseFloat(lastNumber) / 100).toString();
            setCalValue(calValue.slice(0, -lastNumber.length) + percentageValue);
            setDisplayValue(calValue.slice(0, -lastNumber.length) + percentageValue);
        }
        return;
    }

    const displayText = text === "X" ? "×" : text === "/" ? "÷" : text;

    setCursorSel({ end: cursorSel.end + 1, start: cursorSel.start + 1 });
    setCalValue((prev) => {
        if (prev.length !== cursorSel.end && isCursorSel) {
            let leftOver = prev.slice(0, cursorSel.end);
            let rightOver = prev.slice(cursorSel.end, prev.length);
            return `${leftOver}${corrText}${rightOver}`;
        }
        return prev + `${corrText}`;
    });

    setDisplayValue((prev) => {
        if (prev.length !== cursorSel.end && isCursorSel) {
            let leftOver = prev.slice(0, cursorSel.end);
            let rightOver = prev.slice(cursorSel.end, prev.length);
            return `${leftOver}${displayText}${rightOver}`;
        }
        return prev + displayText;
    });
};


  const handleParenthesis = () => {
    const openParentheses = calValue.split("(").length - 1;
    const closeParentheses = calValue.split(")").length - 1;

    if (openParentheses > closeParentheses) {
      handlePress(")");
    } else {
      handlePress("(");
    }
  };

  const handleClear = () => {
    setCalValue("");
    setDisplayValue("");
  };

  const handleEqual = () => {
    if (!calValue) return;
    const result = calculateResult(calValue);
    setCalValue(result);
    setDisplayValue(result.replace(/\*/g, '×').replace(/\//g, '÷'));
    setPreviewValue("");

    setHistory((prev) => [...prev, { equation: calValue, answer: result }]);
    setIsAnswer(true);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  if (showHistory) {
    return (
      <History history={history} clearHistory={clearHistory} goBack={toggleHistory} />
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, ansColor]}
        value={displayValue}
        onChangeText={setCalValue}
        selection={cursorSel}
        cursorColor='#8ad8d1'
        autoFocus={true}
        textAlign='right'
        onSelectionChange={(e) => {
          setIsCursorSel(true);
          setCursorSel(e.nativeEvent.selection);
        }}
        showSoftInputOnFocus={false}
        editable={false}
      />
      <TextInput
        value={previewValue}
        onChangeText={setPreviewValue}
        cursorColor='#8ad8d1'
        textAlign='right'
        caretHidden={true}
        showSoftInputOnFocus={false}
        style={[styles.input, styles.prevInput]}
        editable={false}
      />

      <View style={styles.backButton}>
        <Pressable onPress={toggleHistory}>
          <Ionicons name='time' size={30} color="#505050" />
        </Pressable>
        <Pressable onPress={handleBackSpace} disabled={!calValue} style={styles.backspaceButton}>
          <Ionicons
            name='backspace'
            size={30}
            color={calValue ? "orange" : "#505050"}
          />
        </Pressable>
      </View>

      <View style={styles.divider} />

      <View style={styles.buttonContainer}>
        <Row>
          <Button handlePress={handleClear} label={"C"} type='operatorSecondary' />
          <Button
            handlePress={handleParenthesis}
            label={"()"}
            type='operatorSecondary'
            icon={
              <MaterialCommunityIcons
                name='code-parentheses'
                size={30}
                style={{ fontWeight: "bold" }}
              />
            }
          />
          <Button handlePress={handlePress} label={"%"} type='operatorSecondary'
            icon={<FontAwesome5 name='percent' size={21} />} />
          <Button
            handlePress={handlePress}
            label={"/"}
            type='operatorPrimary'
            icon={<FontAwesome5 name='divide' size={21} />}
          />
        </Row>
        <Row>
          <Button handlePress={handlePress} label={"7"} type='digit' />
          <Button handlePress={handlePress} label={"8"} type='digit' />
          <Button handlePress={handlePress} label={"9"} type='digit' />
          <Button
            handlePress={handlePress}
            label={"X"}
            type='operatorPrimary'
            icon={<FontAwesome5 name='times' size={21} />}
          />
        </Row>
        <Row>
          <Button handlePress={handlePress} label={"4"} type='digit' />
          <Button handlePress={handlePress} label={"5"} type='digit' />
          <Button handlePress={handlePress} label={"6"} type='digit' />
          <Button
            handlePress={handlePress}
            label={"-"}
            type='operatorPrimary'
            icon={<FontAwesome name='minus' size={21} />}
          />
        </Row>
        <Row>
          <Button handlePress={handlePress} label={"1"} type='digit' />
          <Button handlePress={handlePress} label={"2"} type='digit' />
          <Button handlePress={handlePress} label={"3"} type='digit' />
          <Button
            handlePress={handlePress}
            label={"+"}
            type='operatorPrimary'
            icon={<FontAwesome name='plus' size={21} />}
          />
        </Row>
        <Row>
          <Button handlePress={handlePress} label={"√"} type='digit' />
          <Button handlePress={handlePress} label={"0"} type='digit' />
          <Button handlePress={handlePress} label={"."} type='digit' />
          <Button handlePress={handleEqual} label={"="} type='equal'
            icon={<FontAwesome5 name='equals' size={21} />} />
        </Row>
      </View>

      <StatusBar style='light' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingTop: 60,
    paddingHorizontal: 8,
  },
  input: {
    fontSize: 34,
    fontWeight: "400",
    color: "white",
    paddingHorizontal: 8,
    marginBottom: 1,
    marginTop: 66,
    flex: 0.1,
  },
  prevInput: {
    fontSize: 18,
    color: "#bbb",
  },
  divider: {
    height: 1,
    backgroundColor: "#222",
    marginVertical: 15,
    alignSelf: "stretch",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backspaceButton: {
    alignSelf: "flex-end",
  },
});
