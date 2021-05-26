/**
  * @author Avramuk A.I
  * @date 19.02.2021
  */
trigger OpportunityTrigger on Opportunity (before insert, before update, after insert, after update) {

    if (Trigger.isBefore && Trigger.isInsert) {
        OpportunityTriggerHelper.insertDateEachStage(Trigger.new);
    } else if (Trigger.isBefore && Trigger.isUpdate) {
        OpportunityTriggerHelper.updateDateEachStage(Trigger.new, Trigger.oldMap);
    }

}