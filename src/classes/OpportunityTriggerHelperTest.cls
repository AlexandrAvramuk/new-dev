@IsTest
private class OpportunityTriggerHelperTest {

    @TestSetup
    static void setup() {

    }

    @IsTest
    static void testInsertDateEachStage() {
        Test.startTest();
        Account account = new Account(
                Name = 'test'
        );
        insert account;

        Opportunity sobj = new Opportunity(
                AccountId = account.Id,
                CloseDate = Date.today(),
                fidprocessclosedate__c = Datetime.now(),                    // Close Date
                Name = 'New Opportunity: Healthcare',                       // Opportunity Name
                StageName = 'Initial Outreach',                                      // Stage
                Opportunity_Type__c = 'Direct to employer',                 // Opportunity Type
                Probability = 25,                                           // Probability (%)
                Top_Targets__c = false,                                     // Top Targets
                fid17__c = 250,                                           // # Employees/Members/
                RFI__c = false,                                             // RFI
                RFP__c = false,                                             // RFP
                Product_New__c = 'Core Enterprise',                         // Product
                Implementation_Fees__c = 120.00,                            // Implementation Fees
                Fee_per_Member_Employee__c = 100.00,                        // Fee per Member/Employee
                Pilot__c = false,                                           // Pilot
                Pricing_Model__c = 'Case Rate',                             // Pricing Model
                CaseRateAmount__c = 150000.00
        );
        insert sobj;

        Opportunity soqlOpportunity = [SELECT DateOfInitialOutreach__c FROM Opportunity WHERE Id = :sobj.Id];
        Test.stopTest();

        System.assertEquals(soqlOpportunity.DateOfInitialOutreach__c, (Decimal.valueOf(DateTime.now().getTime()) / 1000 / 60 / 60 / 24).round());
    }

    @IsTest
    static void testUpdateDateEachStage() {
        Test.startTest();
        Account account = new Account(
                Name = 'test'
        );
        insert account;

        Opportunity sobj = new Opportunity(
                AccountId = account.Id,
                CloseDate = Date.today(),
                fidprocessclosedate__c = Datetime.now(),                    // Close Date
                Name = 'New Opportunity: Healthcare',                       // Opportunity Name
                StageName = 'Initial Outreach',                                      // Stage
                Opportunity_Type__c = 'Direct to employer',                 // Opportunity Type
                Probability = 25,                                           // Probability (%)
                Top_Targets__c = false,                                     // Top Targets
                fid17__c = 250,                                           // # Employees/Members/
                RFI__c = false,                                             // RFI
                RFP__c = false,                                             // RFP
                Product_New__c = 'Core Enterprise',                         // Product
                Implementation_Fees__c = 120.00,                            // Implementation Fees
                Fee_per_Member_Employee__c = 100.00,                        // Fee per Member/Employee
                Pilot__c = false,                                           // Pilot
                Pricing_Model__c = 'Case Rate',                             // Pricing Model
                CaseRateAmount__c = 150000.00
        );
        insert sobj;

        sobj.StageName = 'Qualify/Demo';
        update sobj;
        Opportunity soqlQualify = [SELECT DateOfQualifyDemo__c FROM Opportunity WHERE Id = :sobj.Id];
        Test.stopTest();
        System.assertEquals(soqlQualify.DateOfQualifyDemo__c, (Decimal.valueOf(DateTime.now().getTime()) / 1000 / 60 / 60 / 24).round());
    }

}