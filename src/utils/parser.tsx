import { StyleSheet, Text } from "react-native";
import { itterationDirection } from "../constants/constant";
import { ExpressionText } from "../components";

// Removes a single character (white space) at the specified index if it's within the bounds of the string.
const removeWhiteSpaceAtIndex = (inputString: String, index: number): String => {
    if (index < 0 || index >= inputString.length) {
        return inputString; // Return original string if index is out of bounds
    }
    const beforeIndex = inputString.substring(0, index); // Get substring before the specified index
    const afterIndex = inputString.substring(index + 1); // Get substring after the specified index
    return beforeIndex + afterIndex; // Concatenate the two substrings, effectively removing the character at index
}

// Transforms the LaTeX string content to a simpler format suitable for further processing or display.
const transformStringContent = (string: String): String => {
  string = cleanWhitespace(string); // First clean up the whitespace throughout the string
  let result = string;

  // Continuously replace complex LaTeX markers with simpler ones until none are left
  while(true){
      if(result.indexOf("\\[") === -1 && result.indexOf("\\]") === -1){
          break; // Exit loop if no more LaTeX markers are found
      } else {
          // Handle LaTeX opening marker
          result = itterateWhiteSpaces(result, result.indexOf("\\[")+2, itterationDirection.forward);
          result = removeWhiteSpaceAtIndex(result, result.indexOf("\\[")+2);
          result = result.replace("\\[", "$");

          // Handle LaTeX closing marker
          result = itterateWhiteSpaces(result, result.indexOf("\\]")-1, itterationDirection.backward);
          result = removeWhiteSpaceAtIndex(result, result.indexOf("\\]")-1);
          result = result.replace("\\]", "$$");
      }
  }
  
  return result.replace(/\$\$/g, '$'); // Final clean up to ensure markers are uniformly formatted
}

// Iterates over white spaces from a given index, removing them in the specified direction.
const itterateWhiteSpaces = (text: String, index: number, direction = itterationDirection.forward) : String => {
  while(true){
      if(direction == itterationDirection.forward){
          if(isWhitespaceAtIndex(text[index])){
              text = removeWhiteSpaceAtIndex(text, index) // Remove whitespace going forward
          } else {
              break; // Stop if no whitespace is found
          }
      } else {
          if(isWhitespaceAtIndex(text[index - 1])){
              text = removeWhiteSpaceAtIndex(text, index); // Remove whitespace going backward
              index--;
          } else {
              break; // Stop if no whitespace is found
          }
      }
  }
  return text;
}

// Checks if the character at the given index in the text string is a whitespace.
const isWhitespaceAtIndex = (text: string) => {
  return /\s/.test(text); // Regex to check for any whitespace character
}

// Cleans up unnecessary whitespace from the text, particularly useful before parsing LaTeX.
const cleanWhitespace = (text: String) : String => {
  return text.split('\n').map(line => line.trim().replace(/[ \t]+/g, ' ')).join('\n'); // Trim each line and reduce multiple spaces to a single space
}

// Converts CSS style string into an object that React Native can interpret.
const convertStyle = (css: string) : Object => {
  const styleObj = {};
  const properties = css.split(';');
  properties.forEach(property => {
    const [key, value] = property.split(':');
    if (key && value) {
      const formattedKey = key.trim().replace(/-(\w)/g, (match, p1) => p1.toUpperCase()); // Convert CSS property names to camelCase
      styleObj[formattedKey] = value.trim(); // Trim value and assign to the style object
    }
  });
  return styleObj;
}

// Parses the content and splits it into React Native Text components, handling inline LaTeX equations.
const parseContent = (content, parentStyle = {}) => {
  const elements = [];
  let lastIdx = 0;
  const regex = /\$(.+?)\$/g; // Regex to capture content within dollar signs for equations

  let match;
  while ((match = regex.exec(content)) !== null) {
    const textBefore = content.substring(lastIdx, match.index); // Get text before the equation
    if (textBefore.trim()) {
      elements.push(<Text key={`text-${lastIdx}`} style={parentStyle}>{textBefore}</Text>); // Push text as Text component
    }

    const equation = match[1]; // Get the equation content
    if (equation && equation.trim()) {
      elements.push(<ExpressionText text={`$${equation}$`} />) // Push equation formatted as LaTeX
    }

    lastIdx = regex.lastIndex; // Update last index processed
  }
  
  const remainingText = content.substring(lastIdx); // Get any remaining text after last match
  if (remainingText.trim()) {
    elements.push(<Text key={`text-after-${lastIdx}`} style={parentStyle}>{remainingText}</Text>); // Push remaining text as Text component
  }

  return elements;
}

// Parses HTML content into React Native Views and Text components, applying inline styles.
const parseHtml = (html, parentStyle = {}) => {
  const elements = [];
  const tagRegex = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g; // Regex to capture HTML tags and content
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
      elements.push(...parseContent(html.substring(lastPos, tagStart), parentStyle)); // Parse content before the tag
    }

    const styleMatch = attrs.match(/style="([^"]+)"/); // Match the style attribute
    if (styleMatch) {
      inlineStyles = convertStyle(styleMatch[1]); // Convert CSS string to style object
    }

    const combinedStyles = {...parentStyle, ...inlineStyles}; // Combine parent styles with inline styles

    const key = `${tagName}-${lastPos}`;
    const childContent = parseHtml(content, combinedStyles); // Recursively parse inner HTML
  
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

export {
    parseHtml,
    parseContent,
    convertStyle,
    transformStringContent
}