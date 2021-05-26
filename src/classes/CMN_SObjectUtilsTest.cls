@IsTest
private class CMN_SObjectUtilsTest {

    @IsTest
    static void testGetPicklistValues() {
        List<String> lStrings = CMN_SObjectUtils.getPicklistValues('Opportunity', 'Reason__c');
    }

    @IsTest
    static void testMapValueLabelPicklist() {

        List<String> allPickListOpp = new List<String>{
                'Reason__c', 'ProposalType__c'
        };
        Map<String, Map<String, String>> picklistStrings = CMN_SObjectUtils.getMapValueLabelPicklist(
                'Opportunity',
                allPickListOpp);
    }
}