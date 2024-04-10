import React, { memo } from "react";
import { MathText } from 'react-native-math-view';
import { transformStringContent } from "../../utils/parser";

interface ExpressionTextProps {
    text: string;
}
  
const ExpressionText: React.FC<ExpressionTextProps> = ({ text }) => {
    return (
        <MathText value={transformStringContent(text)} />
    );
};

export default memo(ExpressionText);