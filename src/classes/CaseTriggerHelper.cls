/**
  * @author Avramuk A.I
  * @date 29.03.2021.
  */

public with sharing class CaseTriggerHelper {

    public static void aContactReferralSourceCustomerServiceQueue(List<Case> newList) {
        Group groupQueue = [
                SELECT Id, Name
                FROM Group
                WHERE Type = 'Queue'
                AND Name = 'Customer Service Queue'
        ];

        List<String> userEmailAddresses = new List<String>();
        List<Case> fromEmailToCases = new List<Case>();

        for (Case item : newList) {
            //First exclude any cases where the contact is set
            if (item.ContactId == null && item.OwnerId == groupQueue.Id &&
                    (item.SuppliedEmail != '' || item.SuppliedEmail == null)) {
                userEmailAddresses.add(item.SuppliedEmail);
                fromEmailToCases.add(item);
            }
        }

        List<Contact> listOfAllContacts = [
                SELECT Id, Email
                FROM Contact
                WHERE Email
                        IN :userEmailAddresses
        ];

        Map<String, Contact> excludeStingEmails = new Map<String, Contact>();
        for (Contact c : listOfAllContacts) {
            excludeStingEmails.put(c.Email, c);
        }

        Map<String, Contact> emailToContactMap = new Map<String, Contact>();

        List<Case> casesToUpdate = new List<Case>();

        for (Case c : fromEmailToCases) {
            if (!excludeStingEmails.keySet().contains(c.SuppliedEmail)) {
                //The case was created with a null contact
                //Let's make a contact for it
                String[] EmailHeader = c.SuppliedName.split(' ', 2);
                if (EmailHeader.size() == 2) {
                    Contact conts = new Contact(FirstName = EmailHeader[0],
                            LastName = EmailHeader[1],
                            Email = c.SuppliedEmail,
                            LeadSource = 'Customer Service'
                    );
                    emailToContactMap.put(c.SuppliedEmail, conts);
                    casesToUpdate.add(c);
                }
            } else if (excludeStingEmails.keySet().contains(c.SuppliedEmail)) {
                // The case has been created, and the organization has this contact
                // link the contact record to the case
                c.ContactId = excludeStingEmails.get(c.SuppliedEmail).Id;
            }
        }

        List<Contact> newContacts = emailToContactMap.values();
        insert newContacts;

        for (Case c : casesToUpdate) {
            Contact newContact = emailToContactMap.get(c.SuppliedEmail);
            c.ContactId = newContact.Id;
        }
    }

    public static void aContactReferralSourceEnsembleHelpQueue(List<Case> newList) {
        Group groupQueue = [
                SELECT Id, Name
                FROM Group
                WHERE Type = 'Queue'
                AND Name = 'Ensemble Help Queue'
        ];

        List<String> userEmailAddresses = new List<String>();
        List<Case> fromEmailToCases = new List<Case>();

        for (Case item : newList) {
            //First exclude any cases where the contact is set
            if (item.ContactId == null && item.OwnerId == groupQueue.Id &&
                    (item.SuppliedEmail != '' || item.SuppliedEmail == null)) {
                userEmailAddresses.add(item.SuppliedEmail);
                fromEmailToCases.add(item);
            }
        }

        List<Contact> listOfAllContacts = [
                SELECT Id, Email
                FROM Contact
                WHERE Email
                        IN :userEmailAddresses
        ];

        Map<String, Contact> excludeStingEmails = new Map<String, Contact>();
        for (Contact c : listOfAllContacts) {
            excludeStingEmails.put(c.Email, c);
        }

        Map<String, Contact> emailToContactMap = new Map<String, Contact>();

        List<Case> casesToUpdate = new List<Case>();

        for (Case c : fromEmailToCases) {
            if (!excludeStingEmails.keySet().contains(c.SuppliedEmail)) {
                //The case was created with a null contact
                //Let's make a contact for it
                String[] EmailHeader = c.SuppliedName.split(' ', 2);
                if (EmailHeader.size() == 2) {
                    Contact conts = new Contact(FirstName = EmailHeader[0],
                            LastName = EmailHeader[1],
                            Email = c.SuppliedEmail,
                            LeadSource = 'Ensemble Customer Service'
                    );
                    emailToContactMap.put(c.SuppliedEmail, conts);
                    casesToUpdate.add(c);
                }
            } else if (excludeStingEmails.keySet().contains(c.SuppliedEmail)) {
                // The case has been created, and the organization has this contact
                // link the contact record to the case
                c.ContactId = excludeStingEmails.get(c.SuppliedEmail).Id;
            }
        }

        List<Contact> newContacts = emailToContactMap.values();
        insert newContacts;

        for (Case c : casesToUpdate) {
            Contact newContact = emailToContactMap.get(c.SuppliedEmail);
            c.ContactId = newContact.Id;
        }
    }
}