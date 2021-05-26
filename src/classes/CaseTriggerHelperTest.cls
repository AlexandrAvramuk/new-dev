/**
  * @author Avramuk A.I
  * @date 30.03.2021.
  */
@IsTest
private class CaseTriggerHelperTest {

    @IsTest
    public static  void testBulkContactsGetCreated() {
        Group groupQueue = [
                SELECT Id, Name
                FROM Group
                WHERE Type = 'Queue'
                AND Name = 'Customer Service Queue'
        ];

        List<Case> newCases = new List<Case>();
        for (Integer i = 0; i<100; i++) {
            Case c = new Case(SuppliedEmail='jdoe_test_test@doe.com' + i,
                    SuppliedName='John Doe' + i,
                    Subject='Feedback - Something' + i,
                    OwnerId = groupQueue.Id);
            newCases.add(c);
        }
        insert newCases;

        List<Id> newCaseIds = new List<Id>();
        for (Case caseObj:newCases) {
            newCaseIds.add(caseObj.Id);
        }

        List<Case> updatedCases = [SELECT ContactId FROM Case WHERE Id IN :newCaseIds];

        for (Case caseObj:updatedCases) {
            System.debug(caseObj.Id + ' ' + caseObj.ContactId);
            System.assert(caseObj.ContactId!=null,'There should be no null contacts');
        }
    }

    @IsTest
    public static  void testContactGetsCreated() {
        Group groupQueue = [
                SELECT Id, Name
                FROM Group
                WHERE Type = 'Queue'
                AND Name = 'Customer Service Queue'
        ];
        Case c = new Case(SuppliedEmail='jdoe_test_test@doe.com',
                SuppliedName='John Doe',
                Subject='Feedback - Something',
                OwnerId = groupQueue.Id);
        insert c;

        List<Contact> johnDoes = [SELECT Id FROM Contact WHERE Email='jdoe_test_test@doe.com'];

        //there should be only 1 -- the trigger should not have created another
        System.assert(johnDoes.size()==1, 'There should be one John Doe!');

        Case caseObj = [SELECT ContactId FROM Case WHERE Id=:c.Id];
        System.assert(caseObj.ContactId!=null,'There should be no null contact on the case');
    }

    @IsTest
    public static  void testNoDupesAreCreated() {
        Contact cnt1 = new Contact(FirstName = 'John',
                LastName = 'Doe',
                Email='jdoe_test_test@doe.com');

        insert cnt1;

        Group groupQueue = [
                SELECT Id, Name
                FROM Group
                WHERE Type = 'Queue'
                AND Name = 'Customer Service Queue'
        ];

        Case case1 = new Case(SuppliedEmail='jdoe_test_test@doe.com',
                SuppliedName='John Doe',
                Subject='Feedback - Something',
                OwnerId = groupQueue.Id);

        insert case1;

        List<Contact> johnDoes = [SELECT Id FROM Contact WHERE Email='jdoe_test_test@doe.com'];

        //there should be only 1 -- the trigger should not have created another
        System.assert(johnDoes.size()==1, 'There should be only one John Doe!');
    }

    @IsTest
    public static  void testEmailNameDoesntGetCreated() {
        Group groupQueue = [
                SELECT Id, Name
                FROM Group
                WHERE Type = 'Queue'
                AND Name = 'Customer Service Queue'
        ];

        Case c = new Case(SuppliedEmail='testEmailNameDoesntGetCreated@doe.com',
                SuppliedName='testEmailNameDoesntGetCreated@doe.com',
                Subject='Feedback - Something',
                OwnerId = groupQueue.Id);
        insert c;

        List<Contact> johnDoes = [SELECT Id FROM Contact WHERE Email='testEmailNameDoesntGetCreated@doe.com'];

        //there should be only 1 -- the trigger should not have created another
        System.assert(johnDoes.size()==0, 'There should be no John Does!');
    }

}