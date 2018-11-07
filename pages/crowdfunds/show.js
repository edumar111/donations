import React, { Component } from 'react';
import { Card, Grid, Button } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import Crowdfund from '../../ethereum/crowdfund';
import web3 from '../../ethereum/web3';
import ContributeForm from '../../components/ContributeForm';
import { Link } from '../../routes';

class CrowdfundShow extends Component {
  static async getInitialProps(props) {
    const crowdfund = Crowdfund(props.query.address);

    const summary = await crowdfund.methods.getSummary().call();

    return {
      address: props.query.address,
      minimumContribution: summary[0],
      balance: summary[1],
      expendituresCount: summary[2],
      approversCount: summary[3],
      manager: summary[4]
    };
  }

  renderCards() {
    const {
      balance,
      manager,
      minimumContribution,
      expendituresCount,
      approversCount
    } = this.props;

    const items = [
      {
        header: manager,
        meta: 'Address of Manager',
        description:
          'The manager created this Crowdfund and can create Expenditures to withdraw money',
        style: { overflowWrap: 'break-word' }
      },
      {
        header: minimumContribution,
        meta: 'Minimum Contribution (wei)',
        description:
          'You must contribute at least this much wei to become an approver'
      },
      {
        header: expendituresCount,
        meta: 'Number of Expenditures',
        description:
          'A request tries to withdraw money from the contract. Expenditures must be approved by approvers'
      },
      {
        header: approversCount,
        meta: 'Number of Approvers',
        description:
          'Number of people who have already donated to this crowdfund'
      },
      {
        header: web3.utils.fromWei(balance, 'ether'),
        meta: 'Crowdfund Balance (ether)',
        description:
          'The balance is how much money this crowdfund has left to spend.'
      }
    ];

    return <Card.Group items={items} />;
  }

  render() {
    return (
      <Layout>
        <h3>Crowdfund Show</h3>
        <Grid>
          <Grid.Row>
            <Grid.Column width={12}>{this.renderCards()}</Grid.Column>

            <Grid.Column width={4}>
              <ContributeForm address={this.props.address} />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <Link route={`/crowdfunds/${this.props.address}/expenditures`}>
                <a>
                  <Button primary>View Expenditures</Button>
                </a>
              </Link>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default CrowdfundShow;
