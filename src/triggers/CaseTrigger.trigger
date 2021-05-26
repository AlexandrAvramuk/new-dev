/**
  * @author Avramuk A.I
  * @date 29.03.2021.
  */
trigger CaseTrigger on Case (before insert) {

    if (Trigger.isBefore && Trigger.isInsert) {
        CaseTriggerHelper.aContactReferralSourceCustomerServiceQueue(Trigger.new);
        CaseTriggerHelper.aContactReferralSourceEnsembleHelpQueue(Trigger.new);
    }
}