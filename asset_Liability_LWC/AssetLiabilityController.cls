public class AssetLiabilityController {
    @AuraEnabled(cacheable=true)
    public static List<AssetLiability__c> getAssetLiabilityDtails() {
        return [
            SELECT Id,Type__c,Name,Balance__c FROM AssetLiability__c
        ];
    }
    @AuraEnabled
    public static void deleteAssetDetailRec(String assetLiabilityId)
    {
        try
        {
            if(String.isNotBlank(assetLiabilityId))
            {
                List<AssetLiability__c> asset_Details_List = [  SELECT Id,Type__c,Name,Balance__c FROM AssetLiability__c WHERE Id = : assetLiabilityId];
                System.debug('asset_Details_List : '+asset_Details_List);
                if(asset_Details_List != null && !asset_Details_List.isEmpty())
                {
                    Database.delete(asset_Details_List, FALSE);
                }
            }
        }
        catch(Exception e)
        {
            System.debug('Exception : '+e);
        }
        
    }
    @AuraEnabled
    public static AssetWrapper getAssetTotals() {
        Decimal assetTotal=0;
        Decimal liabilityTotal=0;
        List<AssetLiability__c> listAsstLiab = [
            SELECT Id,Type__c,Name,Balance__c FROM AssetLiability__c
        ];
       	AssetWrapper objAW=new AssetWrapper();
        for(AssetLiability__c objAL:listAsstLiab){
            if(objAL.Type__c == 'Asset'){
                assetTotal += objAL.Balance__c;
            }
            if(objAL.Type__c == 'Liability'){
                liabilityTotal += objAL.Balance__c;
            }
        }
        objAW.assetTotal = String.valueOf(assetTotal);
        objAW.liabilityTotal = String.valueOf(liabilityTotal);
        return objAW;
    }
    public class AssetWrapper{
        @AuraEnabled
        public String assetTotal{get; set;}
        @AuraEnabled
        public String liabilityTotal {get; set;}
    }
}