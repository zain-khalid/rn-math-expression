import React from 'react';
import { HomeScreen } from './src/screens';
import { ScrollView, SafeAreaView } from 'react-native';


const App = () => {
  return (
    <SafeAreaView>
      <ScrollView style={{ padding: 20 }}>
        <HomeScreen />
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
