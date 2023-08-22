public class AssignmentListController {

    @AuraEnabled(cacheable=true)
   public static List<Assignment__c> getAllAssigmentRecords( String searchKey, String sortBy, String sortDirection) {
      
       String query = 'SELECT Id, Name,Description__c,DueDate__c,Status__c,Title__c FROM Assignment__c';
       
       system.debug('query---'+query);

       if ( searchKey != null && searchKey != '' ) {
           String key = '%' + searchKey + '%';
           query += ' WHERE Title__c LIKE :key';
       }

       if ( sortBy != null && sortDirection != null ) {
           query += ' ORDER BY ' + sortBy + ' ' + sortDirection;
       }

       //query = query + ' LIMIT 10';
       
       return Database.query( query );
   }

}