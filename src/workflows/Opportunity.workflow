<?xml version="1.0" encoding="UTF-8"?>
<Workflow xmlns="http://soap.sforce.com/2006/04/metadata">
    <fieldUpdates>
        <fullName>Greater</fullName>
        <field>CheckDate__c</field>
        <literalValue>Greate</literalValue>
        <name>Greater</name>
        <notifyAssignee>false</notifyAssignee>
        <operation>Literal</operation>
        <protected>false</protected>
    </fieldUpdates>
    <fieldUpdates>
        <fullName>Less</fullName>
        <field>CheckDate__c</field>
        <literalValue>Less</literalValue>
        <name>Less</name>
        <notifyAssignee>false</notifyAssignee>
        <operation>Literal</operation>
        <protected>false</protected>
    </fieldUpdates>
    <rules>
        <fullName>Contract End Date Greater than Today</fullName>
        <actions>
            <name>Greater</name>
            <type>FieldUpdate</type>
        </actions>
        <active>true</active>
        <formula>ContractEndDate__c  &gt;=  TODAY()</formula>
        <triggerType>onCreateOrTriggeringUpdate</triggerType>
    </rules>
    <rules>
        <fullName>Contract End Date Less than Today</fullName>
        <actions>
            <name>Less</name>
            <type>FieldUpdate</type>
        </actions>
        <active>true</active>
        <formula>ContractEndDate__c  &lt;  TODAY()</formula>
        <triggerType>onCreateOrTriggeringUpdate</triggerType>
    </rules>
</Workflow>
