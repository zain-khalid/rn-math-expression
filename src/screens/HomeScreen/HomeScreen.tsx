import React, { useState } from "react";
import { Button, ScrollView, TextInput, View } from "react-native";
import { ExpressionText } from "../../components";
import { dummyContent } from "../../constants/dummyContent";
import styles from "./styles";
import { parseHtml, transformStringContent } from "../../utils/parser";

const HomeScreen = () => {

    const [text, setTest] = useState(dummyContent)
    const [value, setValue] = useState(dummyContent)

    return(
        <View style={styles.container} >
            <TextInput
                value={value}
                multiline={true}
                numberOfLines={3}
                style={styles.inputContainer}
                placeholder={"Enter content to parse"}
                onChangeText={(value)=>{setValue(value)}}
            />
            <Button 
                title={"Parse content"}
                onPress={()=>{setTest(value)}}
            />
            <ScrollView style={{flex:1}} >
                <View>
                    {parseHtml(transformStringContent(text))}
                </View>
            </ScrollView>
        </View>
    )
}

export default HomeScreen;