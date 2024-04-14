import React from 'react';
import { Text, View, Image, StyleSheet, ScrollView } from 'react-native';
import { Parser } from 'htmlparser2';

const sampleHtml = `
<div>
  <h1>Welcome to React Native</h1>
  <p>This is a paragraph with <a href="#">a link</a> and some <strong>bold text</strong>.</p>
  <img src="https://via.placeholder.com/150" />
</div>
`;



function parseHtml(html) {
  const root = { type: 'tag', name: 'root', attribs: {}, children: [] };
  let current = root;
  const stack = [root];

  const parser = new Parser({
    onopentag(name, attribs) {
      const element = { type: 'tag', name, attribs, children: [] };
      current.children.push(element);
      stack.push(element);
      current = element;
    },
    ontext(text) {
      const textNode = { type: 'text', data: text };
      current.children.push(textNode);
    },
    onclosetag() {
      stack.pop();
      current = stack[stack.length - 1];
    }
  }, { decodeEntities: true });

  parser.write(html);
  parser.end();

  return root.children;
}

function renderNode(node) {
  if (node.type === 'text') {
    return node.data;
  }

  const children = node.children.map(renderNode);

  switch (node.name) {
    case 'div':
      return <View style={styles.div}>{children}</View>;
    case 'p':
      return <Text style={styles.p}>{children}</Text>;
    case 'img':
      return <Image source={{ uri: node.attribs.src }} style={styles.image} />;
    case 'a':
      return <Text style={styles.a}>{children}</Text>;
    default:
      return children;
  }
}

const styles = StyleSheet.create({
  div: { margin: 10 },
  p: { fontSize: 16, color: 'black' },
  a: { color: 'blue', textDecorationLine: 'underline' },
  image: { width: 100, height: 100 },
});

function HtmlToReactNative(html = sampleHtml) {
  const parsedHtml = parseHtml(html);
  return <ScrollView>{parsedHtml.map(renderNode)}</ScrollView>;
}

export default HtmlToReactNative;