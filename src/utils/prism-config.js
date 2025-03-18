import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

// Initialize Prism when running in browser
if (typeof window !== 'undefined') {
  Prism.highlightAll();
}

// Optional: Add custom theme configuration
Prism.plugins.customClass.map({
  number: 'prism-number',
  string: 'prism-string',
  comment: 'prism-comment',
  keyword: 'prism-keyword',
  boolean: 'prism-boolean',
  operator: 'prism-operator',
  punctuation: 'prism-punctuation'
});

export default Prism;