@IsTest
private class ControllerChangeOppStatusTest {

    @IsTest
            static void testGetPicklistsLabelAndValueReason(){
        List<String> strings =  ControllerChangeOppStatus.getPicklistsLabelAndValueReason();
        System.assertEquals(strings, CMN_SObjectUtils.getPicklistValues('Opportunity', 'Reason__c'));
    }

    @IsTest
    static void testGetPicklistsLabelAndValueProposalType(){
        List<String> strings =  ControllerChangeOppStatus.getPicklistsLabelAndValueProposalType();
        System.assertEquals(strings, CMN_SObjectUtils.getPicklistValues('Opportunity', 'ProposalType__c'));
    }

    @IsTest
    static void testGetPicklistsLabelAndValuePricingModel(){
        List<String> strings =  ControllerChangeOppStatus.getPicklistsLabelAndValuePricingModel();
        System.assertEquals(strings, CMN_SObjectUtils.getPicklistValues('Opportunity', 'Pricing_Model__c'));
    }

    @IsTest
    static void testOpportunityStage() {
        List<OpportunityStage> opportunityStages = [
                SELECT ApiName, IsClosed, SortOrder
                FROM OpportunityStage
                WHERE IsActive = true
                ORDER BY SortOrder
        ];
        List<OpportunityStage> opportunityStagesTest = ControllerChangeOppStatus.getPicklistsValueStages();
        System.assertEquals(opportunityStagesTest, opportunityStages);
    }

    @IsTest
    static void testUpdateStagesOpp() {

        Account account = new Account(Name = 'UserAccountName');
        insert account;


        Opportunity sobj = new Opportunity(
                AccountId = account.Id,
                Name = 'Lead Information-',
                CloseDate = Date.valueOf('2020-09-21'),
                StageName = 'Initial Outreach',
                Opportunity_Type__c = 'Consultant',
                Product_New__c = 'DTx – FDA'
        );

        insert sobj;

        sobj.StageName = 'Finalist';
        sobj.Implementation_Fees__c = 120.00;                            // Implementation Fees
        sobj.Fee_per_Member_Employee__c = 100.00;

        Opportunity testUpdateOpp = ControllerChangeOppStatus.updateStagesOpp(JSON.serialize(sobj));
        System.assertEquals(testUpdateOpp.StageName, sobj.StageName);
    }

    @IsTest
    static void testGetOpp() {
        Account account = new Account(Name = 'UserAccountName');
        insert account;

        Opportunity sobj = new Opportunity(
                AccountId = account.Id,
                Name = 'Lead Information-',
                CloseDate = Date.valueOf('2020-09-21'),
                StageName = 'Initial Outreach',
                Opportunity_Type__c = 'Consultant',
                Product_New__c = 'DTx – FDA'
        );

        insert sobj;
        Opportunity testGetOpp = ControllerChangeOppStatus.getOpp(sobj.Id);
        System.assertEquals(testGetOpp.Id, sobj.Id);
    }
}