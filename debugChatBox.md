info: SHN_Gear.Services.GeminiService[0]
[GeminiService] Prompt length: 439 chars (~109 tokens)
info: System.Net.Http.HttpClient.GeminiService.LogicalHandler[100]
Start processing HTTP request POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?_
info: System.Net.Http.HttpClient.GeminiService.ClientHandler[100]
Sending HTTP request POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?_
info: System.Net.Http.HttpClient.GeminiService.ClientHandler[101]
Received HTTP response headers after 3466.4704ms - 200
info: System.Net.Http.HttpClient.GeminiService.LogicalHandler[101]
End processing HTTP request after 3477.2641ms - 200
info: SHN_Gear.Services.GeminiService[0]
[GeminiService] Gemini API response: {
"candidates": [
{
"content": {
"role": "model"
},
"finishReason": "MAX_TOKENS",
"index": 0
}
],
"usageMetadata": {
"promptTokenCount": 174,
"totalTokenCount": 323,
"promptTokensDetails": [
{
"modality": "TEXT",
"tokenCount": 174
}
],
"thoughtsTokenCount": 149
},
"modelVersion": "gemini-2.5-pro",
"responseId": "qyR-aLiRN9mkjMcPrO-jqQ0"
}

warn: SHN_Gear.Services.GeminiService[0]
[GeminiService] No content parts in response. FinishReason: MAX_TOKENS
info: SHN_Gear.Services.GeminiService[0]
[GeminiService] Retrying with shorter prompt...
info: System.Net.Http.HttpClient.GeminiService.LogicalHandler[100]
Start processing HTTP request POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?_
info: System.Net.Http.HttpClient.GeminiService.ClientHandler[100]
Sending HTTP request POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?_
info: System.Net.Http.HttpClient.GeminiService.ClientHandler[101]
Received HTTP response headers after 6957.0083ms - 200
info: System.Net.Http.HttpClient.GeminiService.LogicalHandler[101]
End processing HTTP request after 6957.0984ms - 200
info: SHN_Gear.Services.GeminiService[0]
[GeminiService] Prompt length: 413 chars (~103 tokens)
info: System.Net.Http.HttpClient.GeminiService.LogicalHandler[100]
Start processing HTTP request POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?_
info: System.Net.Http.HttpClient.GeminiService.ClientHandler[100]
Sending HTTP request POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?_
info: System.Net.Http.HttpClient.GeminiService.ClientHandler[101]
Received HTTP response headers after 5229.6453ms - 200
info: System.Net.Http.HttpClient.GeminiService.LogicalHandler[101]
End processing HTTP request after 5229.7221ms - 200
info: SHN_Gear.Services.GeminiService[0]
[GeminiService] Gemini API response: {
"candidates": [
{
"content": {
"role": "model"
},
"finishReason": "MAX_TOKENS",
"index": 0
}
],
"usageMetadata": {
"promptTokenCount": 161,
"totalTokenCount": 310,
"promptTokensDetails": [
{
"modality": "TEXT",
"tokenCount": 161
}
],
"thoughtsTokenCount": 149
},
"modelVersion": "gemini-2.5-pro",
"responseId": "uCR-aIqgB7KOjMcPhcqDqA0"
}

warn: SHN_Gear.Services.GeminiService[0]
[GeminiService] No content parts in response. FinishReason: MAX_TOKENS
info: SHN_Gear.Services.GeminiService[0]
[GeminiService] Retrying with shorter prompt...
info: System.Net.Http.HttpClient.GeminiService.LogicalHandler[100]
Start processing HTTP request POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?_
info: System.Net.Http.HttpClient.GeminiService.ClientHandler[100]
Sending HTTP request POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?_
info: System.Net.Http.HttpClient.GeminiService.ClientHandler[101]
Received HTTP response headers after 6831.4367ms - 200
info: System.Net.Http.HttpClient.GeminiService.LogicalHandler[101]
End processing HTTP request after 6831.5291ms - 200
dbug: Microsoft.EntityFrameworkCore.ChangeTracking[10808]
'AppDbContext' generated a temporary value for the property 'ChatMessage.Id'. Consider using 'DbContextOptionsBuilder.EnableSensitiveDataLogging' to see key values.
dbug: Microsoft.EntityFrameworkCore.ChangeTracking[10805]
The navigation 'ChatMessage.ChatSession' was detected as changed. Consider using 'DbContextOptionsBuilder.EnableSensitiveDataLogging' to see key values.
dbug: Microsoft.EntityFrameworkCore.ChangeTracking[10806]
Context 'AppDbContext' started tracking 'ChatMessage' entity. Consider using 'DbContextOptionsBuilder.EnableSensitiveDataLogging' to see key values.  
dbug: Microsoft.EntityFrameworkCore.Update[10004]
SaveChanges starting for 'AppDbContext'.
dbug: Microsoft.EntityFrameworkCore.ChangeTracking[10800]
DetectChanges starting for 'AppDbContext'.
dbug: Microsoft.EntityFrameworkCore.ChangeTracking[10801]
DetectChanges completed for 'AppDbContext'.
dbug: Microsoft.EntityFrameworkCore.Database.Connection[20000]
Opening connection to database 'ShnGear' on server 'KIEMANHKIEMEM\SQLEXPRESS'.
dbug: Microsoft.EntityFrameworkCore.Database.Connection[20001]
Opened connection to database 'ShnGear' on server 'KIEMANHKIEMEM\SQLEXPRESS'.
dbug: Microsoft.EntityFrameworkCore.Database.Command[20103]
Creating DbCommand for 'ExecuteReader'.
dbug: Microsoft.EntityFrameworkCore.Database.Command[20104]
Created DbCommand for 'ExecuteReader' (0ms).
dbug: Microsoft.EntityFrameworkCore.Database.Command[20106]
Initialized DbCommand for 'ExecuteReader' (0ms).
dbug: Microsoft.EntityFrameworkCore.Database.Command[20100]
Executing DbCommand [Parameters=[@p0='?' (Precision = 5) (Scale = 3) (DbType = Decimal), @p1='?' (Size = 4000), @p2='?' (Size = 4000), @p3='?' (Size = 4000), @p4='?' (DbType = Int32), @p5='?' (Size = 4000), @p6='?' (DbType = Boolean), @p7='?' (Size = 4000), @p8='?' (DbType = Boolean), @p9='?' (DbType = Int32), @p10='?' (DbType = Int32), @p11='?' (DbType = DateTime2), @p12='?' (Size = 4000), @p13='?' (DbType = Int32)], CommandType='Text', CommandTimeout='30']
SET IMPLICIT_TRANSACTIONS OFF;
SET NOCOUNT ON;
INSERT INTO [ChatMessages] ([AIConfidenceScore], [AIContext], [AIIntent], [AttachmentsJson], [ChatSessionId], [Content], [IsRead], [MetadataJson], [RequiresEscalation], [Sender], [SenderId], [SentAt], [SuggestedActionsJson], [Type])
OUTPUT INSERTED.[Id]
VALUES (@p0, @p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13);
info: Microsoft.EntityFrameworkCore.Database.Command[20101]
Executed DbCommand (4ms) [Parameters=[@p0='?' (Precision = 5) (Scale = 3) (DbType = Decimal), @p1='?' (Size = 4000), @p2='?' (Size = 4000), @p3='?' (Size = 4000), @p4='?' (DbType = Int32), @p5='?' (Size = 4000), @p6='?' (DbType = Boolean), @p7='?' (Size = 4000), @p8='?' (DbType = Boolean), @p9='?' (DbType = Int32), @p10='?' (DbType = Int32), @p11='?' (DbType = DateTime2), @p12='?' (Size = 4000), @p13='?' (DbType = Int32)], CommandType='Text', CommandTimeout='30']
SET IMPLICIT_TRANSACTIONS OFF;
SET NOCOUNT ON;
INSERT INTO [ChatMessages] ([AIConfidenceScore], [AIContext], [AIIntent], [AttachmentsJson], [ChatSessionId], [Content], [IsRead], [MetadataJson], [RequiresEscalation], [Sender], [SenderId], [SentAt], [SuggestedActionsJson], [Type])
OUTPUT INSERTED.[Id]
VALUES (@p0, @p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13);
dbug: Microsoft.EntityFrameworkCore.ChangeTracking[10803]
The foreign key property 'ChatMessage.Id' was detected as changed. Consider using 'DbContextOptionsBuilder.EnableSensitiveDataLogging' to see property values.
dbug: Microsoft.EntityFrameworkCore.Database.Command[20301]
Closing data reader to 'ShnGear' on server 'KIEMANHKIEMEM\SQLEXPRESS'.
dbug: Microsoft.EntityFrameworkCore.Database.Command[20300]
A data reader for 'ShnGear' on server 'KIEMANHKIEMEM\SQLEXPRESS' is being disposed after spending 0ms reading results.
dbug: Microsoft.EntityFrameworkCore.Database.Connection[20002]
Closing connection to database 'ShnGear' on server 'KIEMANHKIEMEM\SQLEXPRESS'.
dbug: Microsoft.EntityFrameworkCore.Database.Connection[20003]
Closed connection to database 'ShnGear' on server 'KIEMANHKIEMEM\SQLEXPRESS' (0ms).
dbug: Microsoft.EntityFrameworkCore.ChangeTracking[10807]
An entity of type 'ChatMessage' tracked by 'AppDbContext' changed state from 'Added' to 'Unchanged'. Consider using 'DbContextOptionsBuilder.EnableSensitiveDataLogging' to see key values.
dbug: Microsoft.EntityFrameworkCore.Update[10005]
SaveChanges completed for 'AppDbContext' with 1 entities written to the database.
dbug: Microsoft.EntityFrameworkCore.Database.Connection[20000]
Opening connection to database 'ShnGear' on server 'KIEMANHKIEMEM\SQLEXPRESS'.
dbug: Microsoft.EntityFrameworkCore.Database.Connection[20001]
Opened connection to database 'ShnGear' on server 'KIEMANHKIEMEM\SQLEXPRESS'.
dbug: Microsoft.EntityFrameworkCore.Database.Command[20103]
Creating DbCommand for 'ExecuteReader'.
dbug: Microsoft.EntityFrameworkCore.Database.Command[20104]
Created DbCommand for 'ExecuteReader' (0ms).
dbug: Microsoft.EntityFrameworkCore.Database.Command[20106]
Initialized DbCommand for 'ExecuteReader' (0ms).
dbug: Microsoft.EntityFrameworkCore.Database.Command[20100]
Executing DbCommand [Parameters=[@__sessionId_0='?' (Size = 4000)], CommandType='Text', CommandTimeout='30']
SELECT TOP(1) [c].[Id], [c].[AssignedAdminId], [c].[ConfidenceScore], [c].[CreatedAt], [c].[GuestEmail], [c].[GuestName], [c].[LastActivityAt], [c].[RequiresHumanSupport], [c].[SessionId], [c].[Status], [c].[Type], [c].[UserContext], [c].[UserId]
FROM [ChatSessions] AS [c]
WHERE [c].[SessionId] = @**sessionId_0
info: Microsoft.EntityFrameworkCore.Database.Command[20101]
Executed DbCommand (2ms) [Parameters=[@**sessionId_0='?' (Size = 4000)], CommandType='Text', CommandTimeout='30']
SELECT TOP(1) [c].[Id], [c].[AssignedAdminId], [c].[ConfidenceScore], [c].[CreatedAt], [c].[GuestEmail], [c].[GuestName], [c].[LastActivityAt], [c].[RequiresHumanSupport], [c].[SessionId], [c].[Status], [c].[Type], [c].[UserContext], [c].[UserId]
FROM [ChatSessions] AS [c]
WHERE [c].[SessionId] = @\_\_sessionId_0
dbug: Microsoft.EntityFrameworkCore.Database.Command[20301]
Closing data reader to 'ShnGear' on server 'KIEMANHKIEMEM\SQLEXPRESS'.
dbug: Microsoft.EntityFrameworkCore.Database.Command[20300]
A data reader for 'ShnGear' on server 'KIEMANHKIEMEM\SQLEXPRESS' is being disposed after spending 0ms reading results.
dbug: Microsoft.EntityFrameworkCore.Database.Connection[20002]
Closing connection to database 'ShnGear' on server 'KIEMANHKIEMEM\SQLEXPRESS'.
dbug: Microsoft.EntityFrameworkCore.Database.Connection[20003]
Closed connection to database 'ShnGear' on server 'KIEMANHKIEMEM\SQLEXPRESS' (0ms).
info: SHN_Gear.Services.ChatService[0]
Sent message to user_10 group
info: SHN_Gear.Services.ChatService[0]
Sent message to admins group for session d72a26ff-f75c-42ae-ad9b-b3c7ea2431b9
info: SHN_Gear.Services.ChatService[0]
Sent real-time message for session d72a26ff-f75c-42ae-ad9b-b3c7ea2431b9
