using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace TeacherTech.Api.Converters;

/// <summary>
/// Permite que campos Guid? no JSON recebam strings vazias (""), nulos ou identificadores inválidos/temporários
/// sem que o System.Text.Json lance exceção de desserialização (400 Bad Request).
/// </summary>
public class NullableGuidJsonConverter : JsonConverter<Guid?>
{
    public override Guid? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
            return null;

        if (reader.TokenType == JsonTokenType.String)
        {
            var str = reader.GetString();
            if (string.IsNullOrWhiteSpace(str))
                return null;

            if (Guid.TryParse(str, out var guid))
                return guid;

            // Retorna null para strings que não são GUIDs válidos (ex: IDs temporários de front-end)
            return null;
        }

        return null;
    }

    public override void Write(Utf8JsonWriter writer, Guid? value, JsonSerializerOptions options)
    {
        if (value.HasValue)
            writer.WriteStringValue(value.Value.ToString());
        else
            writer.WriteNullValue();
    }
}

/// <summary>
/// Permite que campos Guid no JSON recebam strings vazias ou valores inválidos convertendo com segurança
/// para Guid.Empty em vez de lançar exceção de desserialização.
/// </summary>
public class GuidJsonConverter : JsonConverter<Guid>
{
    public override Guid Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var str = reader.GetString();
            if (string.IsNullOrWhiteSpace(str))
                return Guid.Empty;

            if (Guid.TryParse(str, out var guid))
                return guid;

            return Guid.Empty;
        }

        return Guid.Empty;
    }

    public override void Write(Utf8JsonWriter writer, Guid value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString());
    }
}
