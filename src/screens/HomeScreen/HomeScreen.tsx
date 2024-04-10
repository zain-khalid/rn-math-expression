import React from "react";
import { ScrollView, View } from "react-native";
import { ExpressionText } from "../../components";
import { dummyContent } from "../../constants/dummyContent";
import styles from "./styles";

const HomeScreen = () => {
    return(
        <ScrollView style={{flex:1}} >
            <View style={styles.container}>
                <ExpressionText text={dummyContent} />
            </View>
        </ScrollView>
    )
}

export default HomeScreen;