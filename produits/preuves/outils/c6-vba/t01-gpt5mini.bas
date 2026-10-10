Sub TrierEtMettreEnGras()
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim rng As Range
    Dim cell As Range
    
    On Error GoTo ErrHandler
    Application.ScreenUpdating = False
    Application.EnableEvents = False
    
    Set ws = ThisWorkbook.Worksheets("Ventes")
    
    ' Trouver la dernière ligne contenant des données en colonne A, B ou C
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
    If ws.Cells(ws.Rows.Count, "B").End(xlUp).Row > lastRow Then lastRow = ws.Cells(ws.Rows.Count, "B").End(xlUp).Row
    If ws.Cells(ws.Rows.Count, "C").End(xlUp).Row > lastRow Then lastRow = ws.Cells(ws.Rows.Count, "C").End(xlUp).Row
    
    If lastRow < 2 Then GoTo CleanExit ' pas de données
    
    ' Plage de données (en-têtes en ligne 1)
    Set rng = ws.Range("A1:C" & lastRow)
    
    ' Trier par colonne C (montant) du plus grand au plus petit
    rng.Sort Key1:=ws.Range("C2"), Order1:=xlDescending, Header:=xlYes
    
    ' Mettre en gras les montants supérieurs à 50 000 et retirer le gras sinon
    For Each cell In ws.Range("C2:C" & lastRow)
        If IsNumeric(cell.Value) Then
            If cell.Value > 50000 Then
                cell.Font.Bold = True
            Else
                cell.Font.Bold = False
            End If
        Else
            cell.Font.Bold = False
        End If
    Next cell

CleanExit:
    Application.EnableEvents = True
    Application.ScreenUpdating = True
    Exit Sub

ErrHandler:
    MsgBox "Erreur : " & Err.Description, vbExclamation
    Resume CleanExit
End Sub
