public class AssignmentFormController {

    @AuraEnabled
    public static Assignment__c upsertAssignmentRecord(String assignmentRecordData){

        try{

            Assignment__c assignmentObj = new Assignment__c();
            assignmentObj = (Assignment__c) JSON.deserialize(assignmentRecordData,Assignment__c.class);

            SObjectAccessDecision decision = Security.stripInaccessible(AccessType.UPSERTABLE,new List<Assignment__c>{assignmentObj});
            upsert decision.getRecords()[0];

            return assignmentObj;

        } catch(Exception ex){
            throw new AuraHandledException(ex.getmessage());
        }

    }

}