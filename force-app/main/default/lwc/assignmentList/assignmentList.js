import { LightningElement, wire, api, track} from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAllAssigmentRecords from '@salesforce/apex/AssignmentListController.getAllAssigmentRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const columns = [
    { label: 'Name', fieldName: 'Name', type: 'text', sortable: false },
    { label: 'Title', fieldName: 'Title__c', type: 'text', sortable: true },
    { label: 'Description', fieldName: 'Description__c', type: 'text', sortable: false },
    { label: 'Due Date', fieldName: 'DueDate__c', type: 'date', sortable: false },
    { label: 'Status', fieldName: 'Status__c', type: 'text', sortable: false },
    { type: 'button-icon', label: 'Action', typeAttributes: { name: 'Edit', title: 'Edit', value: 'edit', iconName:'utility:edit'}}
];

export default class AssignmentList extends LightningElement {

    @track value;
    @track error;
    @track data;
    @api sortedDirection = 'asc';
    @api sortedBy = 'DueDate__c';
    @api searchKey = '';
    result;
    @track allSelectedRows = [];
    @track page = 1; 
    @track items = []; 
    @track data = []; 
    @track columns; 
    @track startingRecord = 1;
    @track endingRecord = 0; 
    @track pageSize = 5; 
    @track totalRecountCount = 0;
    @track totalPage = 0;
    isPageChanged = false;
    initialLoad = true;
    showSpinner = false;
    recordResult
    
    openAssigmentForm = false;
    assignmentObjData = {};
  
    @wire(getAllAssigmentRecords, {searchKey: '$searchKey', sortBy: '$sortedBy', sortDirection: '$sortedDirection'})
    wiredAccounts(result) {
        this.recordResult = result;
        if (result.data) {
            this.processRecords(result.data);
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.data = undefined;
        }
    }

    processRecords(data){
        this.items = data;
        this.totalRecountCount = data.length; 
        this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
        
        this.data = this.items.slice(0,this.pageSize); 
        this.endingRecord = this.pageSize;
        this.columns = columns;
        this.showSpinner = false;
    }

    previousHandler() {
        this.isPageChanged = true;
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
    }

    nextHandler() {
        this.isPageChanged = true;
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);            
        }
    }

    displayRecordPerPage(page){

        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);

        this.endingRecord = (this.endingRecord > this.totalRecountCount) ? this.totalRecountCount : this.endingRecord; 

        this.data = this.items.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
    }    
    
    sortColumns( event ) {
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        return refreshApex(this.recordResult);
    }
    
    handleKeyChange( event ) {
        this.showSpinner = true;
        this.searchKey = event.target.value;
        var data = [];
        for(var i=0; i<this.items.length;i++){
            if(this.items[i]!= undefined && this.items[i].Title__c.includes(this.searchKey)){
                data.push(this.items[i]);
            }
        }
        this.processRecords(data);
    }

    handleRowAction(event) {
        if (event.detail.action.name === 'Edit') {
            this.editMode = true;
            console.log('event.detail.row---'+JSON.stringify(event.detail.row));
            this.assignmentObjData = event.detail.row;
            this.openAssigmentForm = true;
        }
    }

    closeModal() {
        this.openAssigmentForm = false;
    }
    submitDetails() {
        this.template.querySelector('c-assignment-form').saveData();
        //this.openAssigmentForm = false;
    }

    handleSuccessfulData(){
        this.openAssigmentForm = false;
        this.showToast('Success','Record saved successfully','success');
        refreshApex(this.recordResult);
    }

    createNewAssignmnet(){
        this.assignmentObjData = {};
        this.openAssigmentForm = true;
        this.editMode = false;
    }

    showToast(title,message,variant) {
        const event = new ShowToastEvent({title: title, message: message, variant: variant, mode: 'dismissable'});
        this.dispatchEvent(event);
    }

}