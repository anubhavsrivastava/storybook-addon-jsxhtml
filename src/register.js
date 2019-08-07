import React from 'react';
import { addons } from '@storybook/addons';
import { STORY_RENDERED } from '@storybook/core-events';

import JSX from './htmlComponent';
import { ADDON_ID, ADDON_PANEL, EVENTS } from './constants';

const Observable = (channel, api) => listener => {
	channel.on(EVENTS.ADD_HTML, listener.next('jsx'));
	api.on(STORY_RENDERED, listener.next('current'));
};

addons.register(ADDON_ID, api => {
	const ob = Observable(addons.getChannel(), api);
	addons.addPanel(ADDON_PANEL, {
		title: 'HTML',
		render: ({ active }) => <JSX key="addon-html" active={active} ob={ob} />
	});
});
