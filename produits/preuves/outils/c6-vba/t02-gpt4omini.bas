Sub TrierEtMettreEnGras()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Ventes")
    
    ' Trier les données par montant (colonne C) du plus gros au plus petit
    ws.Range("A1:C" & ws.Cells(ws.Rows.Count, "A").End(xlUp).Row).Sort _
        Key1:=ws.Range("C2"), Order1:=xlDescending, Header:=xlYes
    
    ' Mettre en gras les montants supérieurs à 50 000
    Dim cell As Range
    For Each cell In ws.Range("C2:C" & ws.Cells(ws.Rows.Count, "C").End(xlUp).Row)
        If cell.Value > 50000 Then
            cell.Font.Bold = True
        End If
    Next cell
End Sub
