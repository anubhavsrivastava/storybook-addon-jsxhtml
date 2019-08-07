import React from 'react';
import { addons } from '@storybook/addons';
import { RenderFunction, Story, StoryDecorator } from '@storybook/react';
import ReactDOMServer from 'react-dom/server';
// import reactElementToJSXString, { Options } from 'react-element-to-jsx-string';
import { html as beautifyHTML } from 'js-beautify';

import { EVENTS } from './constants';

const applyBeforeRender = (domString, options) => {
	if (typeof options.onBeforeRender !== 'function') {
		return domString;
	}

	return options.onBeforeRender(domString);
};

const renderJsx = (code, options) => {
	for (let i = 0; i < options.skip; i++) {
		if (typeof code === 'undefined') {
			console.warn('Cannot skip undefined element');
			return;
		}

		if (React.Children.count(code) > 1) {
			console.warn('Trying to skip an array of elements');
			return;
		}

		if (typeof code.props.children === 'undefined') {
			console.warn('Not enough children to skip elements.');

			if (typeof code.type === 'function' && code.type.name === '') {
				code = code.type(code.props);
			}
		} else {
			if (typeof code.props.children === 'function') {
				code = code.props.children();
			} else {
				code = code.props.children;
			}
		}
	}

	if (typeof code === 'undefined') {
		return console.warn('Too many skip or undefined component');
	}

	while (typeof code.type === 'function' && code.type.name === '') {
		code = code.type(code.props);
	}

	const ooo =
		typeof options.displayName === 'string'
			? {
					...options,
					showFunctions: true,
					displayName: () => options.displayName
			  }
			: options;

	return React.Children.map(code, c => {
		let string = applyBeforeRender(ReactDOMServer.renderToStaticMarkup(c), options);
		const matches = string.match(/\S+=\"([^"]*)\"/g);

		if (matches) {
			matches.forEach(match => {
				string = string.replace(match, match.replace(/&quot;/g, "'"));
			});
		}

		return string;
	}).join('\n');
};

export const htmlDecorator = function(storyFn, parameters) {
	const defaultOpts = {
		skip: 0,
		showFunctions: true,
		enableBeautify: true,
		type: 'html'
	};
	const options = {
		...defaultOpts,
		...((parameters.parameters && parameters.parameters.html) || {})
	};
	const channel = addons.getChannel();

	const story = storyFn();
	let jsx = '';

	if (story.template) {
		if (options.enableBeautify) {
			jsx = beautifyHTML(story.template, options);
		} else {
			jsx = story.template;
		}
	} else {
		const rendered = renderJsx(story, options);

		if (rendered) {
			jsx = rendered;
		}
	}

	channel.emit(EVENTS.ADD_HTML, parameters.id, jsx);

	return <>{story}</>;
};

export default {
	addWithJSX(context, kind, storyFn) {
		return context.add(kind, context => htmlDecorator(storyFn, context));
	}
};
