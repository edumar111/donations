import React, { Component } from 'react';
import { Card, Button } from 'semantic-ui-react';
import factory from '../ethereum/factory';
import Layout from '../components/Layout';
import { Link } from '../routes';
import web3 from '../ethereum/web3';

class CrowdfundIndex extends Component {
  static async getInitialProps() {
    const listFunds = await factory.methods.getDeployedCrowdfunds().call();  
    const crowdfunds = listFunds[0];
    const names = listFunds[1];
    const status = listFunds[2];

    return { crowdfunds,names };
  }

  renderCrowdfunds() {
    const names = this.props.names;
    const items = this.props.crowdfunds.map((address,index) => {
      return {
        header: web3.utils.hexToUtf8( names[index]),
        description: (
          <Link route={`/crowdfunds/${address}`}>
            <a>View Crowdfund</a>
          </Link>
        ),
        fluid: true
      };
    });

    return <Card.Group items={items} />;
  }

  render() {
    return (
      <Layout>
        <div>
          <h3>Open Crowdfunds</h3>

          <Link route="/crowdfunds/new">
            <a>
              <Button
                floated="right"
                content="Create Crowdfund"
                icon="add circle"
                primary
              />
            </a>
          </Link>

          {this.renderCrowdfunds()}
        </div>
      </Layout>
    );
  }
}

export default CrowdfundIndex;
