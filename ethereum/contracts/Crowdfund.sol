pragma solidity ^0.4.24 ;

contract CrowdfundFactory{
    Funds [] public crowdfunds;
    struct Funds {
        address deploy;
        bytes32 name;
        bool status;
    }
    
    function createCrowdfund(uint minimun, string name) public{
       address newCrowdfund =  new Crowdfund(minimun,name,msg.sender );
       Funds memory funds = Funds({
           deploy: newCrowdfund,
           name: stringToBytes32(name),
           status: true
       });
       crowdfunds.push(funds);
    }
    
    function getDeployedCrowdfunds() public view returns (address[], bytes32[], bool[]) {
        uint length = crowdfunds.length;
        bytes32 [] memory names = new bytes32[](length);
        bool [] memory status = new bool[](length);
        address[] memory deploys = new address[](length);
        for (uint index = 0; index < length; index++) {
            deploys[index] = crowdfunds[index].deploy;
            names[index]   = crowdfunds[index].name;
            status[index]  = crowdfunds[index].status;
        }
        return (deploys, names, status);
    }
    
    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }
   
}

contract Crowdfund {
    
    struct Expenditure {
        string description;
        uint amount;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }
    Expenditure[] public expenditures;
    address public owner;
    uint public minimumContribution;
    string public nameCrowdfund;
    mapping(address=>bool) public approvers;
    uint public approversCount;
    
    
    modifier isOwner(){
        require(msg.sender == owner, 'you are not owner');
        _;
    }
    
    constructor(uint minimum, string name ,address creator) public {
        owner = creator;
        minimumContribution = minimum;
        nameCrowdfund = name;
    }
    
    function contribute() public payable{
        require(msg.value > minimumContribution,'does not exceed the minimum contribution amount');
        approvers[msg.sender] = true;
        approversCount++;
    }
    
    function requestExpenditure (string description, uint amount,address recipient ) public isOwner{
        
        Expenditure memory newExpenditure =  Expenditure({
            description: description,
            amount: amount,
            recipient: recipient,
            complete: false,
            approvalCount: 0
            
        });
        expenditures.push(newExpenditure);
    }
    
    function approveExpentidure(uint index) public{
        Expenditure storage expenditure = expenditures[index];
        require(approvers[msg.sender],'it is not an approver');
        require(!expenditure.approvals[msg.sender],'you already approved');
        
        expenditure.approvals[msg.sender]= true;
        expenditure.approvalCount++;
    }
    
    function finalizeExpentidure(uint index) public isOwner{
        Expenditure storage expenditure = expenditures[index];
        require(expenditure.approvalCount > (approversCount/2), "not finalizate, require number minimum approver") ;
        require(!expenditure.complete,  "it has already been finalized!");
        
        expenditure.recipient.transfer(expenditure.amount);
        expenditure.complete = true;
    }
    function getSummary() public view returns (
      uint, uint, uint, uint, address, string
      ) {
        return (
          minimumContribution,
          this.balance,
          expenditures.length,
          approversCount,
          owner,
          nameCrowdfund
        );
    }

    function getExpendituresCount() public view returns (uint) {
        return expenditures.length;
    }
}
