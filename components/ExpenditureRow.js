import React, { Component } from 'react';
import { Table, Button } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import Crowdfund from '../ethereum/crowdfund';

class ExpenditureRow extends Component {
  onApprove = async () => {
    const crowdfund = Crowdfund(this.props.address);

    const accounts = await web3.eth.getAccounts();
    await crowdfund.methods.approveExpentidure(this.props.id).send({
      from: accounts[0]
    });
  };

  onFinalize = async () => {
    const crowdfund = Crowdfund(this.props.address);

    const accounts = await web3.eth.getAccounts();
    await crowdfund.methods.finalizeExpentidure(this.props.id).send({
      from: accounts[0]
    });
  };

  render() {
    const { Row, Cell } = Table;
    const { id, expenditure, approversCount } = this.props;
    const readyToFinalize = expenditure.approvalCount > approversCount / 2;

    return (
      <Row
        disabled={expenditure.complete}
        positive={readyToFinalize && !expenditure.complete}
      >
        <Cell>{id}</Cell>
        <Cell>{expenditure.description}</Cell>
        <Cell>{web3.utils.fromWei(expenditure.value, 'ether')}</Cell>
        <Cell>{expenditure.recipient}</Cell>
        <Cell>
          {expenditure.approvalCount}/{approversCount}
        </Cell>
        <Cell>
          {expenditure.complete ? null : (
            <Button color="green" basic onClick={this.onApprove}>
              Approve
            </Button>
          )}
        </Cell>
        <Cell>
          {expenditure.complete ? null : (
            <Button color="teal" basic onClick={this.onFinalize}>
              Finalize
            </Button>
          )}
        </Cell>
      </Row>
    );
  }
}

export default ExpenditureRow;
