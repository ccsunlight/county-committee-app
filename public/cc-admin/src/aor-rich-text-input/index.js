import debounce from 'lodash.debounce';
import React, { Component } from 'react';
import { createRef } from 'create-react-ref';
import PropTypes from 'prop-types';
import Quill from 'quill';

import './RichTextInput.css';

class RichTextInput extends React.Component {
  constructor(props) {
    super(props);
    this.divRef = createRef();
  }

  componentDidMount() {
    const { input: { value }, options } = this.props;

    this.quill = new Quill(
      this.divRef.current,
      Object.assign(options, { theme: 'snow' })
    );

    this.quill.pasteHTML(value);

    this.editor = this.divRef.current.querySelector('.ql-editor');
    this.quill.on('text-change', debounce(this.onTextChange.bind(this), 500));
  }

  componentWillUnmount() {
    this.quill.off('text-change', this.onTextChange);
    this.quill = null;
  }

  updateDivRef(ref) {
    this.divRef = ref;
  }

  onTextChange() {
    // Removes empty p tags with linebreaks.
    const regEx = new RegExp('<([p][a-z0-9]*)\\b[^>]*>(<br/?>*?)</\\1>', 'g');

    this.props.input.onChange(this.editor.innerHTML.replace(regEx, ''));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.input.value !== this.props.input.value) {
      this.quill.pasteHTML(nextProps.input.value);
    }
  }

  render() {
    return (
      <div className="aor-rich-text-input">
        <div ref={this.divRef} />
      </div>
    );
  }
}

RichTextInput.propTypes = {
  addField: PropTypes.bool.isRequired,
  addLabel: PropTypes.bool.isRequired,
  input: PropTypes.object,
  label: PropTypes.string,
  options: PropTypes.object,
  source: PropTypes.string,
  toolbar: PropTypes.oneOfType([PropTypes.array, PropTypes.bool])
};

RichTextInput.defaultProps = {
  addField: true,
  addLabel: true,
  options: {},
  record: {},
  toolbar: true,
  options: true
};

export default RichTextInput;
