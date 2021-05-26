/**
  * @author Avramuk A.I
  * @date 19.02.2021
  */
public with sharing class OpportunityTriggerHelper {

    public static void updateDateEachStage(List<Opportunity> newList, Map<Id, Opportunity> oldMap) {
        DateTime dt = DateTime.now();
        Decimal dateForStage = (Decimal.valueOf(dt.getTime()) / 1000 / 60 / 60 / 24).round();
        for (Opportunity item : newList) {
            if (item.StageName != oldMap.get(item.Id).StageName) {
                item.DateOfQualifyDemo__c = item.StageName == 'Qualify/Demo' && oldMap.get(item.Id).StageName == 'Initial Outreach' ?
                        dateForStage : item.DateOfQualifyDemo__c;
                item.DateOfProposal__c = item.StageName == 'Proposal' && oldMap.get(item.Id).StageName == 'Qualify/Demo' ?
                        dateForStage : item.DateOfProposal__c;
                item.DateOfNegotiationsFinalist__c = item.StageName == 'Negotiations/Finalist' && oldMap.get(item.Id).StageName == 'Proposal' ?
                        dateForStage : item.DateOfNegotiationsFinalist__c;
                item.DateOfContracting__c = item.StageName == 'Contracting' && oldMap.get(item.Id).StageName == 'Negotiations/Finalist' ?
                        dateForStage : item.DateOfContracting__c;
                item.DateOfClosed__c = (item.StageName == 'Closed Won' || item.StageName == 'Closed Lost' || item.StageName == 'Deferred') && oldMap.get(item.Id).StageName == 'Contracting' ?
                        dateForStage : item.DateOfClosed__c;

            }
        }
    }


    public static void insertDateEachStage(List<Opportunity> newList) {
        DateTime dt = DateTime.now();
        for (Opportunity item : newList) {
            item.DateOfInitialOutreach__c = item.StageName == 'Initial Outreach' ?
                    (Decimal.valueOf(dt.getTime()) / 1000 / 60 / 60 / 24).round() : item.DateOfInitialOutreach__c;
        }

    }
}