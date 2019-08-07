import React from 'react';
import { ActionBar } from '@storybook/components';
import { styled } from '@storybook/theming';
import copy from 'copy-to-clipboard';
import Theme from './theme';
import Prism from './prism';

const Container = styled.div({
	height: '100%',
	overflow: 'auto',
	width: '100%'
});

const Code = styled.pre({
	flex: 1
});

const HTML = props => {
	const [current, setCurrent] = React.useState(undefined);
	const [html, setHTML] = React.useState({});

	const addHTML = (id, newHTML) => setHTML({ ...html, [id]: newHTML });

	React.useEffect(() => {
		props.ob({
			next: type => (type === 'jsx' ? addHTML : setCurrent)
		});
	}, []);

	let code = '';
	let highlighted = '';

	if (current && html[current]) {
		code = html[current];
		highlighted = code ? Prism.highlight(code, Prism.languages.html) : '';
	}

	const copyHTML = React.useCallback(() => copy(code), [code]);

	return props.active ? (
		<Container>
			<Theme>
				<Code dangerouslySetInnerHTML={{ __html: highlighted }} />
				<ActionBar
					actionItems={[
						{
							title: 'Copy',
							onClick: copyHTML
						}
					]}
				/>
			</Theme>
		</Container>
	) : null;
};

export default HTML;
