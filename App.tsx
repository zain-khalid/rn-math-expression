import React from 'react';
import { Text, View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { ExpressionText } from './src/components';
import { transformStringContent } from './src/utils/parser';
import { MathText } from 'react-native-math-view';

const styles = StyleSheet.create({
  text: { fontSize: 16 },
  bold: { fontWeight: 'bold' },
  italic: { fontStyle: 'italic' },
  heading: { fontWeight: 'bold', fontSize: 24 },
  small: { fontSize: 12 },
  paragraph: { marginVertical: 4 },
  list: { paddingLeft: 20 },
  listItem: { fontSize: 16 },
  image: { width: 100, height: 100, resizeMode: 'contain' },
  underline: { textDecorationLine: 'underline' },
  horizontalRule: { borderBottomWidth: 1, marginTop: 10, marginBottom: 10 },
  preformatted: { fontFamily: 'monospace' },
  label: { fontWeight: 'bold' },
  span: { fontSize: 16 }
});

function convertStyle(css) {
  const styleObj = {};
  const properties = css.split(';');
  properties.forEach(property => {
    const [key, value] = property.split(':');
    if (key && value) {
      const formattedKey = key.trim().replace(/-(\w)/g, (match, p1) => p1.toUpperCase());
      styleObj[formattedKey] = value.trim();
    }
  });
  return styleObj;
}

function parseContent(content, parentStyle = {}) {
  const elements = [];
  let lastIdx = 0;
  const regex = /\$(.+?)\$/g; // Adjusted to ensure capturing group is non-greedy

  let match;
  while ((match = regex.exec(content)) !== null) {
    const textBefore = content.substring(lastIdx, match.index);
    if (textBefore.trim()) {
      elements.push(<Text key={`text-${lastIdx}`} style={parentStyle}>{textBefore}</Text>);
    }

    const equation = match[1]; // This is where the potential undefined access might happen
    if (equation && equation.trim()) {
      // console.log("equation >>< ", `$${equation}$`)
      elements.push(<ExpressionText text={`$${equation}$`} />)
      // elements.push(<MathText value={'The first term, $\\int dx", "$$, is straightforward to integrate. It simply represents the integral of $1$$", " with respect to $x", "$$, which is $x$$", ".'} />);
    }

    lastIdx = regex.lastIndex;
  }

  // Add remaining text
  const remainingText = content.substring(lastIdx);
  if (remainingText.trim()) {
    elements.push(<Text key={`text-after-${lastIdx}`} style={parentStyle}>{remainingText}</Text>);
  }

  return elements;
}

function parseHtml(html, parentStyle = {}) {
  const elements = [];
  const tagRegex = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g;
  let lastPos = 0;
  let match;

  while ((match = tagRegex.exec(html)) !== null) {
    const tagStart = match.index;
    const tagEnd = tagRegex.lastIndex;
    const tagName = match[1];
    const attrs = match[2] || "";
    const content = match[3];
    let inlineStyles = {};
    
    if (tagStart > lastPos) {
      elements.push(...parseContent(html.substring(lastPos, tagStart), parentStyle));
    }

    const styleMatch = attrs.match(/style="([^"]+)"/);
    if (styleMatch) {
      inlineStyles = convertStyle(styleMatch[1]);
    }

    const combinedStyles = {...parentStyle, ...inlineStyles};

    const key = `${tagName}-${lastPos}`;
    const childContent = parseHtml(content, parentStyle);

    switch (tagName.toLowerCase()) {
        case 'div':
        case 'section':
          elements.push(<View key={key} style={[styles.block, combinedStyles]}>{parseHtml(content)}</View>);
          break;
        case 'p':
          elements.push(<Text key={key} style={[styles.text, styles.paragraph, combinedStyles]}>{parseHtml(content, styles.text)}</Text>);
          break;
        case 'b':
        case 'strong':
          elements.push(<Text key={key} style={[styles.bold, combinedStyles]}>{parseHtml(content, {...parentStyle, ...styles.bold})}</Text>);
          break;
        case 'i':
          elements.push(<Text key={key} style={[styles.italic, combinedStyles]}>{parseHtml(content, {...parentStyle, ...styles.italic})}</Text>);
          break;
        case 'u':
          elements.push(<Text key={key} style={[styles.underline, combinedStyles]}>{parseHtml(content, {...parentStyle, ...styles.underline})}</Text>);
          break;
        case 'small':
          elements.push(<Text key={key} style={[styles.small, combinedStyles]}>{parseHtml(content, {...parentStyle, ...styles.small})}</Text>);
          break;
        case 'span':
          elements.push(<Text key={key} style={[styles.span, combinedStyles]}>{parseHtml(content, styles.span)}</Text>);
          break;
        case 'label':
          elements.push(<Text key={key} style={[styles.label, combinedStyles]}>{parseHtml(content, styles.label)}</Text>);
          break;
        case 'ul':
          elements.push(<View key={key} style={[styles.list, combinedStyles]}>{parseHtml(content)}</View>);
          break;
        case 'li':
          elements.push(<Text key={key} style={[styles.listItem, combinedStyles]}>{parseHtml(content, styles.listItem)}</Text>);
          break;
        case 'br':
          elements.push(<Text key={key} style={[{height: 20}, combinedStyles]}>{''}</Text>);
          break;
        case 'hr':
          elements.push(<View key={key} style={[styles.horizontalRule, combinedStyles]} />);
          break;
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          elements.push(<Text key={key} style={[styles.heading, {fontSize: 30 - 4 * parseInt(tagName[1], 10)}, combinedStyles]}>{parseHtml(content)}</Text>);
          break;
        case 'pre':
          elements.push(<Text key={key} style={[styles.preformatted, combinedStyles]}>{parseHtml(content, styles.preformatted)}</Text>);
          break;
      }

    lastPos = tagEnd;
  }

  if (lastPos < html.length) {
    elements.push(...parseContent(html.substring(lastPos), parentStyle));
  }

  return elements;
}

const App = () => {
  const htmlContent = `
    <p style="color: blue;"><b>The square root of</b> $x^2 + 25", "$$ in the denominator and the $x^2 + 25$$", " in the numerator essentially cancel out</p>
    <p>When we look at the first part of the expression, $\\int \\frac{x^2 + 25}{\\sqrt{x^2 + 25}} dx$$, we notice that the numerator is essentially the same as what's inside the square root in the denominator, just without the square root. This means we can simplify this part of the integral significantly.

    The square root of $x^2 + 25", "$$ in the denominator and the $x^2 + 25$$", " in the numerator essentially cancel out, leaving us with:
    \\[
    \\int dx - \\int \\frac{25}{\\sqrt{x^2 + 25}} dx
    \\]
    
    The first term, $\\int dx", "$$, is straightforward to integrate. It simply represents the integral of $1$$", " with respect to $x", "$$, which is $x$$", ". 
    
    Now, for the second term, $\\int \\frac{25}{\\sqrt{x^2 + 25}} dx$$, it looks a bit more complex due to the square root in the denominator. However, this is a standard form that can be approached with trigonometric substitution or by recognizing it as a derivative of a known function. 
    
    Before we tackle the second term, do you understand how we simplified the first part and why $\\int dx", "$$ equals $x$$", "?</p>
  `;

  // console.log(transformStringContent(htmlContent))

  return (
    <SafeAreaView>
      <ScrollView style={{ padding: 20 }}>
        {/* $int dx - \int \frac{25}{\sqrt{x^2 + 25}} dx$ */}
        {parseHtml(transformStringContent(htmlContent))}
        {/* <MathText value={"$int dx - \int \frac{25}{\sqrt{x^2 + 25}} dx$$"} /> */}
        {/* <ExpressionText text={htmlContent} /> */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
