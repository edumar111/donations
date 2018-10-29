pragma solidity ^0.4.24 ;

contract CrowdfundFactory{
    address [] public deployedCrowdfunds;
    
    function createCrowdfund(uint minimun) public{
       address newCrowdfund =  new Crowdfund(minimun,msg.sender );
       deployedCrowdfunds.push(newCrowdfund);
    }
    function getDeployedCrowdfunds() public view returns (address[]){
        return deployedCrowdfunds;
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
    mapping(address=>bool) public approvers;
    uint public approversCount;
    
    
    modifier isOwner(){
        require(msg.sender == owner, 'you are not owner');
        _;
    }
    
    constructor(uint minimum, address creator) public {
        owner = creator;
        minimumContribution = minimum;
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
}
