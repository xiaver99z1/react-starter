import React from 'react';
import { shallow } from 'enzyme';
import {sum} from './math';
import App from '../App';

describe('First React component test with Enzyme', () => {
    it('renders without crashing', () => {
        expect(<App />).toMatchSnapshot();

    });
});

describe('Examining the syntax of Jest tests', () => {

    it('sums numbers', () => {
        expect(sum(1, 2)).toEqual(3);
        expect(sum(2, 2)).toEqual(4);
    });
});
