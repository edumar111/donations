import React, { Component } from 'react';
import { Button, Table } from 'semantic-ui-react';
import { Link } from '../../../routes';
import Layout from '../../../components/Layout';
import Crowdfund from '../../../ethereum/crowdfund';
import ExpenditureRow from '../../../components/ExpenditureRow';

class ExpenditureIndex extends Component {
  static async getInitialProps(props) {
    const { address } = props.query;
    const crowdfund = Crowdfund(address);
    const expenditureCount = await crowdfund.methods.getExpendituresCount().call();
    const approversCount = await crowdfund.methods.approversCount().call();

    const expenditures = await Promise.all(
      Array(parseInt(expenditureCount))
        .fill()
        .map((element, index) => {
          return crowdfund.methods.expenditures(index).call();
        })
    );

    return { address, expenditures, expenditureCount, approversCount };
  }

  renderRows() {
    return this.props.expenditures.map((expenditure, index) => {
      return (
        <ExpenditureRow
          key={index}
          id={index}
          expenditure={expenditure}
          address={this.props.address}
          approversCount={this.props.approversCount}
        />
      );
    });
  }

  render() {
    const { Header, Row, HeaderCell, Body } = Table;

    return (
      <Layout>
        <h3>Expenditures</h3>
        <Link route={`/crowdfunds/${this.props.address}/expenditures/new`}>
          <a>
            <Button primary floated="right" style={{ marginBottom: 10 }}>
              Add Expenditure
            </Button>
          </a>
        </Link>
        <Table>
          <Header>
            <Row>
              <HeaderCell>ID</HeaderCell>
              <HeaderCell>Description</HeaderCell>
              <HeaderCell>Amount</HeaderCell>
              <HeaderCell>Recipient</HeaderCell>
              <HeaderCell>Approval Count</HeaderCell>
              <HeaderCell>Approve</HeaderCell>
              <HeaderCell>Finalize</HeaderCell>
            </Row>
          </Header>
          <Body>{this.renderRows()}</Body>
        </Table>
        <div>Found {this.props.expenditureCount} expenditures.</div>
      </Layout>
    );
  }
}

export default ExpenditureIndex;
