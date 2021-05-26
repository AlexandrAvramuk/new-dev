public class ControllerChangeOppStatus {

    @AuraEnabled(cacheable=true)
    public static List<String> getPicklistsLabelAndValueReason() {
        return CMN_SObjectUtils.getPicklistValues('Opportunity', 'Reason__c');
    }

    @AuraEnabled(cacheable=true)
    public static List<String> getPicklistsLabelAndValueProposalType() {
        return CMN_SObjectUtils.getPicklistValues('Opportunity', 'ProposalType__c');
    }

    @AuraEnabled(cacheable=true)
    public static List<String> getPicklistsLabelAndValuePricingModel() {
        return CMN_SObjectUtils.getPicklistValues('Opportunity', 'Pricing_Model__c');
    }

    @AuraEnabled(cacheable=true)
    public static List<OpportunityStage> getPicklistsValueStages() {
        return [
                SELECT ApiName, IsClosed, SortOrder
                FROM OpportunityStage
                WHERE IsActive = true
                ORDER BY SortOrder
        ];
    }

    @AuraEnabled
    public static Opportunity updateStagesOpp(String obj) {
        Opportunity opportunity = (Opportunity) JSON.deserialize(obj, Opportunity.class);
        if(opportunity.StageName != 'Closed Won' && opportunity.StageName != 'Closed Lost'){
            opportunity.Reason__c =  '';
            opportunity.OtherReasons__c = '';
        }
        opportunity.OtherReasons__c = opportunity.Reason__c != 'Lost - Other' && opportunity.Reason__c != 'Won - Other' ? '' : opportunity.OtherReasons__c;
        update opportunity;
        return opportunity;
    }

    @AuraEnabled
    public static Opportunity getOpp(String recordId) {
        return [
                SELECT Id, StageName, Reason__c, DeferredDate__c, Amount, CloseDate, OtherReasons__c, ProposalType__c,
                         Implementation_Fees__c, ContractLength__c, Fee_per_Member_Employee__c, Pricing_Model__c,
                        CaseRateAmount__c
                FROM Opportunity
                WHERE Id = :recordId
        ];
    }
}