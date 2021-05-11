import { LightningElement,track,wire } from 'lwc'; 
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// importing to get the object info 
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import getAssetLiabilityDtails from '@salesforce/apex/AssetLiabilityController.getAssetLiabilityDtails';
import deleteAssetDetailRec from '@salesforce/apex/AssetLiabilityController.deleteAssetDetailRec';
import getAssetTotals from '@salesforce/apex/AssetLiabilityController.getAssetTotals';
import { refreshApex } from '@salesforce/apex';
import { getRecord } from 'lightning/uiRecordApi';

const actions = [
    { label: 'Delete', name: 'delete' }
];
const COLS = [
    { label: 'Type', fieldName: 'Type__c', editable: false,initialWidth:370},
    { label: 'Name', fieldName: 'Name', editable: false, sortable: true,initialWidth:370},
    { label: 'Balance', fieldName: 'Balance__c', editable: false,initialWidth:370},
    { label: 'Delete Record', type: 'action', typeAttributes: { rowActions: actions, menuAlignment: 'right' },fixedWidth :150}
];

export default class Asset_Liability_LWC extends NavigationMixin(LightningElement) {
    @track columns = COLS;
    @track totalEmerRep;
    @track totalPermRep;
		@track assetTotal=0;
		@track liabilityTotal=0;
		@track networth=0;
		@track showNegativeSign=false;
		@track type='';
		draftValues = [];
		
		@wire(getAssetLiabilityDtails)
    assetData
		connectedCallback(){
				this.getAssetTotals();
		}
		handleRowAction(event) {
				try{
        const action = event.detail.action;
				const row = event.detail.row;
        let rowData = JSON.stringify(row);
        let finalRowData = JSON.parse(rowData);
        let assetLiabilityId = finalRowData.Id;
				switch (action.name) {
            case 'delete':
                this.deleteRecord(assetLiabilityId);
                break;
        }
				}catch(error){
						console.log('Error--->',error)
				}
    }
		deleteRecord(assetLiabilityId){
				deleteAssetDetailRec({assetLiabilityId: assetLiabilityId })
                    .then(result => {
                        console.log('Delete Res',result);
												setTimeout(() => {window.location.reload(true);},1000);
                    })
                    .catch(error => {
                        this.error = error;
                    });
		}
    getAssetTotals() {
        getAssetTotals()
            .then(result => {
						this.assetTotal = result.assetTotal;
							this.liabilityTotal = result.liabilityTotal;
							if(this.liabilityTotal > this.assetTotal){
								this.netWorth=this.liabilityTotal - this.assetTotal;
									this.showNegativeSign = true;
							}else{
								this.netWorth=this.assetTotal - this.liabilityTotal;
									this.showNegativeSign = false;
							}
					})
            .catch(error => {
                this.error = error;
						console.log('Error--->',error);
            });
    }
		  handleSuccess(event) {
			console.log('Rec Id : ' + event.detail.id);
			let recId = event.detail.id;
			console.log('type===',this.type);
			if(this.type !== 'Asset' && this.type !== 'Liability'){
					event.preventDefault();
						const evt = new ShowToastEvent({
            title: 'Error',
            message: 'Please enter the correct value for Type field.Valid value for the selected field is Asset or Liability',
            variant: 'Error',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
				this.deleteRecord(recId);
				setTimeout(() => {window.location.reload(true);},2000);
				}else{
						const evt = new ShowToastEvent({
            title: 'Record insert',
            message: 'The record has been created successfully',
            variant: 'success',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
				setTimeout(() => {window.location.reload(true);},2000);
        refreshApex(this.options);
				}
			}
		saveTypeValue(event){
				this.type = event.detail.value;
		}
}