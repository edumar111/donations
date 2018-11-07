import React from 'react';
import { Menu } from 'semantic-ui-react';
import { Link } from '../routes';

export default () => {
  return (
    <Menu style={{ marginTop: '10px' }}>
      <Link route="/">
        <a className="item">Everis foundation </a>
   	  </Link>

      <Menu.Menu position="right">
        <Link route="/">
          <a className="item">Crowdfunds</a>
        </Link>

      </Menu.Menu>
    </Menu>
  );
};